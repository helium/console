defmodule ConsoleWeb.DeviceController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Devices
  alias Console.Devices.DeviceImports
  alias Console.Channels
  alias Console.Labels
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Labels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  @ttn_url "https://ttn-service.herokuapp.com"

  def create(conn, %{"device" => device_params, "label_id" => label_id}) do
    current_organization = conn.assigns.current_organization
    device_params = Map.merge(device_params, %{"organization_id" => current_organization.id})

    with {:ok, %Device{} = device} <- Devices.create_device(device_params, current_organization) do
      if label_id != nil do
        label = Ecto.assoc(current_organization, :labels) |> Repo.get!(label_id)
        Labels.add_devices_to_label([device.id], label.id, current_organization)
      end

      broadcast(device)

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "#{device.name} created successfully")
      |> render("show.json", device: device)
    end
  end

  def update(conn, %{"id" => id, "device" => device_params}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, id)

    with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do
      broadcast(device, device.id)
      broadcast_router_update_devices(device)

      if device_params["active"] != nil do
        broadcast(device)

        device_labels = Labels.get_labels_of_device(device)
        Enum.each(device_labels, fn l ->
          Absinthe.Subscription.publish(
            ConsoleWeb.Endpoint,
            %{ id: l.label_id },
            label_updated: "#{device.organization_id}/#{l.label_id}/label_updated"
          )
        end)
      end

      conn
      |> put_resp_header("message", "#{device.name} updated successfully")
      |> render("show.json", device: device)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, id)

    with {:ok, %Device{} = device} <- Devices.delete_device(device) do
      broadcast(device)
      broadcast_router_update_devices(device)

      conn
      |> put_resp_header("message", "#{device.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"devices" => devices}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(List.first(devices))

    with {:ok, _} <- Devices.delete_devices(devices, current_organization.id) do
      broadcast(device)

      conn
      |> put_resp_header("message", "Devices deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, _params) do
    device = conn.assigns.current_organization.id
    |> Devices.delete_all_devices_for_org()
    broadcast(device)
    conn
    |> put_resp_header("message", "Deleted all devices successfully")
    |>send_resp(:ok, "")
  end

  def get_ttn(conn, _params) do
    ttn_code = conn
      |> get_req_header("ttn-ctl-code")
      |> List.first()
    case "#{@ttn_url}/access_code/#{ttn_code}"
      |> HTTPoison.post!(Poison.encode!(%{}), [], [recv_timeout: 10000])
      |> Map.get(:body)
      |> Poison.decode() do
        {:ok, data} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(:ok, Poison.encode!(data))
        _ ->
          conn
          |> put_status(:bad_request)
          |> render("error.json", error: "Unable to import devices. Make sure your ttnctl code is valid and try again.")
      end
  end

  def import_ttn(conn, %{
    "applications" => applications,
    "account_token" => token,
    "add_labels" => add_labels,
    "delete_devices" => delete_devices
  }) do
    organization = conn.assigns.current_organization
    user = conn.assigns.current_user
    cond do
      Devices.get_current_imports(organization)
      |> Enum.count() > 0 ->
        conn
        |> put_status(:bad_request)
        |> render("error.json", error: "Already importing devices, try again later.")
      true ->
        case "#{@ttn_url}/exchange"
        |> HTTPoison.post!(
          Poison.encode!(%{apps: applications, account_token: token}),
          [],
          [recv_timeout: 10000]
        )
        |> Map.get(:body)
        |> Poison.decode() do
          {:ok, %{"restricted_token"=> restricted_token}} ->
            Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
              fetch_and_write_devices(
                applications,
                restricted_token,
                organization,
                add_labels,
                delete_devices,
                user.id
              )
            end)
            conn
            |> put_resp_header("message", "Began importing devices from The Things Network.")
            |> send_resp(:ok, "")
          _ ->
            conn
            |> put_status(:unavailable)
            |> render("error.json", error: "Temporarily unable to import devices from The Things Network.")
        end
    end
  end

  def import_generic(conn, %{"devices" => devices, "add_labels" => add_labels}) do
    current_user = conn.assigns.current_user
    current_organization = conn.assigns.current_organization
    {:ok, device_import} = Devices.create_import(current_organization, current_user.id, "generic")
    broadcast_add(device_import)
    Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
      try do
        added_devices = Enum.reduce(devices, %{label_device_map: %{}, device_count: 0}, fn device, acc ->
          case device
          |> Map.put("organization_id", current_organization.id)
          |> Devices.create_device(current_organization) do
            {:ok, new_device} ->
              if Map.has_key?(device, "label_id") do
                if Map.has_key?(acc.label_device_map, device["label_id"]) do
                  %{
                    acc |
                    label_device_map: Map.update!(acc.label_device_map, device["label_id"], fn current ->
                      [new_device | current]
                    end),
                    device_count: acc.device_count + 1
                  }
                else
                  %{
                    acc |
                    label_device_map: Map.put(acc.label_device_map, device["label_id"], [new_device]),
                    device_count: acc.device_count + 1
                  }
                end
              else
                %{acc | device_count: acc.device_count + 1}
              end
            _ -> acc
          end
        end)
        if add_labels do
          Enum.each(added_devices.label_device_map, fn({key, val}) ->
            case Labels.get_label_by_name(key, current_organization.id) do
              nil ->
                label_params = %{"name" => key, "organization_id" => current_organization.id}
                with {:ok, label} <- Labels.create_label(current_organization, label_params) do
                  Enum.reduce(val, [], fn device, acc ->
                    [device.id | acc]
                  end)
                  |> Labels.add_devices_to_label(label.id, current_organization)
                end
              label ->
                Enum.reduce(val, [], fn device, acc ->
                  [device.id | acc]
                end)
                |> Labels.add_devices_to_label(label.id, current_organization)
            end
          end)
        end
        {:ok, successful_import} = Devices.update_import(
          device_import,
          %{
            status: "successful",
            successful_devices: added_devices.device_count
          }
        )
        broadcast_update(successful_import)
      rescue
        _ ->
          {:ok, failed_import} = Devices.update_import(device_import, %{status: "failed"})
          broadcast_update(failed_import)
      end
    end)
    conn
    |> put_resp_header("message", "Began importing devices from CSV.")
    |> send_resp(:ok, "")
  end

  defp fetch_and_write_devices(applications, token, organization, add_labels, delete_devices, user_id) do
    # Create import record
    {:ok, device_import} = Devices.create_import(organization, user_id, "ttn")
    broadcast_add(device_import)
    try do
      device_count = Enum.reduce(applications, 0, fn app, acc ->
        case HTTPoison.request!(
            :get,
            "#{@ttn_url}/devices",
            Poison.encode!(%{restricted_token: token, appid: app})
          )
          |> Map.get(:body)
          |> Poison.decode() do
            {:ok, %{"devices" => devices}} ->
              # Enumerate through retrieved devices and import them
              added_device_list = add_device_list(devices, organization)
              if add_labels do
                label_params = %{"name" => app, "organization_id" => organization.id}
                with {:ok, label} <- Labels.create_label(organization, label_params) do
                  Enum.reduce(added_device_list, [], fn dev, acc ->
                    [dev.id | acc]
                  end)
                  |> Labels.add_devices_to_label(label.id, organization)
                end
              end
              if delete_devices do
                # Delete device records from The Things Network.
                Enum.each(added_device_list, fn dev ->
                  HTTPoison.delete!(
                    "#{dev.endpoint}/applications/#{app}/devices/#{dev.dev_id}",
                    [{"authorization", "Bearer #{token}"}]
                  )
                end)
              end
              acc + Enum.count(added_device_list)
            _ ->
              # Failure to fetch the devices for the app from The Things Network.
              acc
        end
      end)
      {:ok, successful_import} = Devices.update_import(
        device_import,
        %{
          status: "successful",
          successful_devices: device_count
        }
      )
      broadcast_update(successful_import)
    rescue
      _ ->
        {:ok, failed_import} = Devices.update_import(device_import, %{status: "failed"})
        broadcast_update(failed_import)
    end
  end

  defp add_device_list(devices, organization) do
    # Enumerate through devices and add, then add label for device ids
    Enum.reduce(devices, [], fn device, acc ->
      case Devices.create_device(%{
        name: device["dev_id"],
        app_key: device["lorawan_device"]["app_key"],
        app_eui: device["lorawan_device"]["app_eui"],
        dev_eui: device["lorawan_device"]["dev_eui"],
        organization_id: organization.id
      }, organization) do
        {:ok, %Device{} = new_device} -> [
          %{id: new_device.id, dev_id: new_device.name, endpoint: device["endpoint"]} | acc
        ]
        _ -> acc
      end
    end)
  end

  def debug(conn, %{"device" => device_id}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, device_id)

    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:debug:devices", %{ "devices" => [device_id] })

    conn
    |> send_resp(:no_content, "")
  end

  def broadcast(%Device{} = device) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device, device_added: "#{device.organization_id}/device_added")
  end

  def broadcast_add(%DeviceImports{} = device_import) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device_import, import_added: "#{device_import.organization_id}/import_added")
  end

  def broadcast(%Device{} = device, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device, device_updated: "#{device.organization_id}/#{id}/device_updated")
  end

  def broadcast_update(%DeviceImports{} = device_import) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device_import, import_updated: "#{device_import.organization_id}/import_updated")
  end

  defp broadcast_router_update_devices(%Device{} = device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => [device.id] })
  end
end
