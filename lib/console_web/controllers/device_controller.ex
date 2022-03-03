defmodule ConsoleWeb.DeviceController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Devices
  alias Console.Labels
  alias Console.Devices.Device
  alias Console.Labels
  alias Console.AlertEvents
  alias Console.Alerts
  alias Console.AuditActions

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  @ttn_url "https://ttn-service.herokuapp.com"

  def create(conn, %{"device" => device_params, "label" => label} = attrs) do
    current_organization = conn.assigns.current_organization
    user = conn.assigns.current_user
    device_params =
      Map.merge(device_params, %{
        "organization_id" => current_organization.id
      })
      |> Map.drop(["hotspot_address"])

    with {:ok, %Device{} = device} <- Devices.create_device(device_params, current_organization) do
      case label["labelApplied"] do
        nil -> nil
        label_id ->
          label = Ecto.assoc(current_organization, :labels) |> Repo.get!(label_id)
          Labels.add_devices_to_label([device.id], label.id, current_organization)
      end

      case label["newLabel"] do
        nil -> nil
        label_name ->
          Labels.create_labels_add_device(device, [label_name], current_organization, user)
      end

      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_header_count", "graphql:devices_header_count:#{current_organization.id}:device_list_update", %{})
      broadcast_router_update_devices([device.id])

      AuditActions.create_audit_action(
        current_organization.id,
        conn.assigns.current_user.email,
        "device_controller_create",
        attrs
      )

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Device #{device.name} added successfully")
      |> render("show.json", device: device)
    end
  end

  def update(conn, %{"id" => id, "device" => device_params} = attrs) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, id)

    device_params = cond do
      Map.has_key?(device_params, "dev_eui") or Map.has_key?(device_params, "app_eui") ->
        device_params |> Map.put("in_xor_filter", false)
      true ->
        device_params
    end

    with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:resources_update", "graphql:resources_update:#{current_organization.id}:organization_resources_update", %{})
      broadcast_router_update_devices([id])

      if device_params["active"] != nil do
        ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})

        device_labels = Labels.get_labels_of_device(device)
        Enum.each(device_labels, fn l ->
          ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{l.label_id}:update_label_devices", %{})
        end)
      end

      AuditActions.create_audit_action(
        current_organization.id,
        conn.assigns.current_user.email,
        "device_controller_update",
        attrs
      )

      conn
      |> put_resp_header("message", "Device #{device.name} updated successfully")
      |> render("show.json", device: device)
    end
  end

  def delete(conn, %{"id" => id} = attrs) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, id) |> Repo.preload([:labels])

    # grab info for notifications before device(s) deletion
    deleted_device = %{ device_id: id, labels: Enum.map(device.labels, fn l -> l.id end), device_name: device.name }

    with {:ok, %Device{} = device} <- Devices.delete_device(device) do
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_header_count", "graphql:devices_header_count:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
      broadcast_router_update_devices([id])

      { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
      details = %{
        device_name: deleted_device.device_name,
        deleted_by: conn.assigns.current_user.email,
        time: time
      }

      AlertEvents.delete_unsent_alert_events_for_device(deleted_device.device_id)
      AlertEvents.notify_alert_event(deleted_device.device_id, "device", "device_deleted", details, deleted_device.labels)
      Alerts.delete_alert_nodes(deleted_device.device_id, "device")

      AuditActions.create_audit_action(
        current_organization.id,
        conn.assigns.current_user.email,
        "device_controller_delete",
        attrs
      )

      conn
      |> put_resp_header("message", "#{device.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"devices" => devices, "label_id" => label_id} = attrs) do
    current_organization = conn.assigns.current_organization
    list_devices = Devices.get_devices(current_organization, devices) |> Repo.preload([:labels])

    # grab info for notifications before device(s) deletion
    deleted_devices = Enum.map(
      list_devices,
      fn d -> %{ device_id: d.id, labels: Enum.map(d.labels, fn l -> l.id end), device_name: d.name } end
    )

    with {:ok, _} <- Devices.delete_devices(devices, current_organization.id) do
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_header_count", "graphql:devices_header_count:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
      broadcast_router_update_devices(devices)

      if label_id != "none" do
        label = Labels.get_label(current_organization, label_id)
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{label.id}:update_label_devices", %{})
      end

      # now that devices have been deleted, send notification if applicable
      { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
      Enum.each(deleted_devices, fn d ->
        details = %{
          device_name: d.device_name,
          deleted_by: conn.assigns.current_user.email,
          time: time
        }
        AlertEvents.delete_unsent_alert_events_for_device(d.device_id)
        AlertEvents.notify_alert_event(d.device_id, "device", "device_deleted", details, d.labels)
        Alerts.delete_alert_nodes(d.device_id, "device")
      end)

      AuditActions.create_audit_action(
        current_organization.id,
        conn.assigns.current_user.email,
        "device_controller_delete",
        attrs
      )

      conn
      |> put_resp_header("message", "Devices deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, attrs) do
    organization_id = conn.assigns.current_organization.id

    # grab info for notifications before device(s) deletion
    all_devices = Devices.get_devices(organization_id) |> Repo.preload([:labels])
    deleted_devices = Enum.map(
      all_devices,
      fn d -> %{ device_id: d.id, labels: Enum.map(d.labels, fn l -> l.id end), device_name: d.name } end
    )

    Devices.delete_all_devices_for_org(organization_id)
    ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{organization_id}:device_list_update", %{})
    ConsoleWeb.Endpoint.broadcast("graphql:devices_header_count", "graphql:devices_header_count:#{organization_id}:device_list_update", %{})
    ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{organization_id}:organization_devices_in_labels_update", %{})
    ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{organization_id}:all_resources_update", %{})
    broadcast_router_update_devices(all_devices |> Enum.map(fn d -> d.id end))

    # now that devices have been deleted, send notification if applicable
    { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
    Enum.each(deleted_devices, fn d ->
      details = %{
        device_name: d.device_name,
        deleted_by: conn.assigns.current_user.email,
        time: time
      }
      AlertEvents.delete_unsent_alert_events_for_device(d.device_id)
      AlertEvents.notify_alert_event(d.device_id, "device", "device_deleted", details, d.labels)
      Alerts.delete_alert_nodes(d.device_id, "device")
    end)

    AuditActions.create_audit_action(
      organization_id,
      conn.assigns.current_user.email,
      "device_controller_delete",
      attrs
    )

    conn
    |> put_resp_header("message", "Deleted all devices successfully")
    |> send_resp(:ok, "")
  end

  def set_active(conn, %{ "device_ids" => device_ids, "active" => active, "label_id" => label_id }) do
    current_organization = conn.assigns.current_organization

    with {_count, nil} <- Devices.update_devices_active(device_ids, active, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})

      if label_id != "none" do
        label = Labels.get_label(current_organization, label_id)
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{label.id}:update_label_devices", %{})
      end

      if active do
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:active:devices", %{ "devices" => device_ids })
      else
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:inactive:devices", %{ "devices" => device_ids })
      end

      conn
      |> put_resp_header("message", "Devices updated successfully")
      |> send_resp(:no_content, "")
    end
  end

  def remove_config_profiles(conn, %{ "device_ids" => device_ids }) do
    current_organization = conn.assigns.current_organization

    with {_count, nil} <- Devices.update_config_profile_for_devices(device_ids, nil, current_organization.id) do
      ConsoleWeb.Endpoint.broadcast("graphql:config_profiles_index_table", "graphql:config_profiles_index_table:#{current_organization.id}:config_profile_list_update", %{})
      if length(device_ids) == 1 do
        ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{List.first(device_ids)}:device_update", %{})
      end
      broadcast_router_update_devices(device_ids)

      conn
      |> put_resp_header("message", "Devices updated successfully")
      |> send_resp(:no_content, "")
    end
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
    "delete_devices" => delete_devices,
    "delete_apps" => delete_apps
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
                delete_apps,
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
    ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{current_organization.id}:import_list_updated", %{})
    Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
      try do
        added_devices = Enum.reduce(devices, %{label_device_map: %{}, device_count: 0, device_ids: [], failed_devices: []}, fn device, acc ->
          case device
          |> Map.put("organization_id", current_organization.id)
          |> Devices.create_device(current_organization) do
            {:ok, new_device} ->
              label_device_map =
                if Map.has_key?(device, "label_id") do
                  if Map.has_key?(acc.label_device_map, device["label_id"]) do
                    Map.update!(acc.label_device_map, device["label_id"], fn current -> [new_device | current] end)
                  else
                    Map.put(acc.label_device_map, device["label_id"], [new_device])
                  end
                else
                  acc.label_device_map
                end

              label_device_map =
                if Map.has_key?(device, "label_id_2") and (device["label_id_2"] != device["label_id"]) do
                  if Map.has_key?(label_device_map, device["label_id_2"]) do
                    Map.update!(label_device_map, device["label_id_2"], fn current -> [new_device | current] end)
                  else
                    Map.put(label_device_map, device["label_id_2"], [new_device])
                  end
                else
                  label_device_map
                end

              %{
                label_device_map: label_device_map,
                device_count: acc.device_count + 1,
                device_ids: [new_device.id | acc.device_ids],
                failed_devices: acc.failed_devices
              }
            {:error, %Ecto.Changeset{ valid?: false, action: :insert, errors: errors}} ->
              error_msg = errors |> List.first |> elem(1) |> elem(0)
              %{
                label_device_map: acc.label_device_map,
                device_count: acc.device_count,
                device_ids: acc.device_ids,
                failed_devices: ["#{device["name"]}: #{error_msg}" | acc.failed_devices]
              }
            _ ->
              acc
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

        if added_devices.device_count == 0 do
          {:ok, failed_import} = Devices.update_import(device_import, %{status: "failed"})

          ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{current_organization.id}:import_list_updated", %{
            status: "failed",
            user_id: failed_import.user_id,
            type: failed_import.type,
            failed_devices: added_devices.failed_devices
          })
        else
          {:ok, successful_import} = Devices.update_import(
            device_import,
            %{
              status: "successful",
              successful_devices: added_devices.device_count
            }
          )

          ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{current_organization.id}:import_list_updated", %{
            status: "success",
            user_id: successful_import.user_id,
            successful_devices: successful_import.successful_devices,
            type: successful_import.type,
            failed_devices: added_devices.failed_devices
          })
          broadcast_router_update_devices(added_devices.device_ids)
        end
      rescue
        _ ->
          {:ok, failed_import} = Devices.update_import(device_import, %{status: "failed"})
          ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{current_organization.id}:import_list_updated", %{
            status: "failed",
            user_id: failed_import.user_id,
            type: failed_import.type
          })
      end
    end)
    conn
    |> put_resp_header("message", "Began importing devices from CSV.")
    |> send_resp(:ok, "")
  end

  def get_events(conn, %{ "device_id" => device_id }) do
    events = Devices.get_events(device_id)

    conn
    |> put_status(:ok)
    |> render("events.json", events: events)
  end

  defp fetch_and_write_devices(applications, token, organization, add_labels, delete_devices, delete_apps, user_id) do
    # Create import record
    {:ok, device_import} = Devices.create_import(organization, user_id, "ttn")
    ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{organization.id}:import_list_updated", %{})
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
              first_device = added_device_list |> Enum.at(0)
              app_url = if first_device do
                first_device.endpoint
              else
                nil
              end
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
              if delete_apps and app_url do
                HTTPoison.delete!(
                  "#{app_url}/applications/#{app}",
                  [{"authorization", "Bearer #{token}"}]
                )
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
      ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{organization.id}:import_list_updated", %{
        status: "success",
        user_id: successful_import.user_id,
        successful_devices: successful_import.successful_devices,
        type: successful_import.type
      })
    rescue
      _ ->
        {:ok, failed_import} = Devices.update_import(device_import, %{status: "failed"})
        ConsoleWeb.Endpoint.broadcast("graphql:device_import_update", "graphql:device_import_update:#{organization.id}:import_list_updated", %{
          status: "failed",
          user_id: failed_import.user_id,
          type: failed_import.type
        })
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

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
