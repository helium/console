defmodule ConsoleWeb.V1.DeviceController do
  use ConsoleWeb, :controller
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Console.Organizations
  alias Console.Labels
  alias Console.Devices
  alias Console.Devices.Device
  alias Console.ConfigProfiles
  alias Console.Events
  alias Console.AlertEvents
  alias Console.Alerts
  alias Console.AuditActions

  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, %{"app_key" => app_key, "dev_eui" => dev_eui, "app_eui" => app_eui}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_device_attrs(dev_eui, app_eui, app_key, current_organization.id)

    case length(devices) do
      0 ->
        {:error, :not_found, "Device not found"}
      _ ->
        device = List.first(devices) |> Repo.preload([[labels: :config_profile], :config_profile])
        render(conn, "show.json", device: put_config_settings_on_device(device))
    end
  end

  def index(conn, %{"dev_eui" => dev_eui, "app_eui" => app_eui}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_dev_eui_app_eui(current_organization, dev_eui, app_eui)

    case length(devices) do
      0 ->
        {:error, :not_found, "Devices not found"}
      _ ->
        parsed_devices =
          devices
          |> Repo.preload([[labels: :config_profile], :config_profile])
          |> Enum.map(fn d -> put_config_settings_on_device(d) end)
        render(conn, "index.json", devices: parsed_devices)
    end
  end

  def index(conn, %{"dev_eui" => dev_eui}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_dev_eui(current_organization, dev_eui)

    case length(devices) do
      0 ->
        {:error, :not_found, "Devices not found"}
      _ ->
        parsed_devices =
          devices
          |> Repo.preload([[labels: :config_profile], :config_profile])
          |> Enum.map(fn d -> put_config_settings_on_device(d) end)
        render(conn, "index.json", devices: parsed_devices)
    end
  end

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:devices])


    request_id = for _ <- 1..10, into: "", do: <<Enum.random('0123456789abcdef')>>
    :persistent_term.put(request_id, self())
    ids = Enum.map(current_organization.devices, fn device -> device.id end)
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:skf", %{"devices" => ids, "request_id" => request_id})

    parsed_devices =
      current_organization.devices
      |> Repo.preload([[labels: :config_profile], :config_profile])
      |> Enum.map(fn d -> put_config_settings_on_device(d) end)

    receive do
      {:skf, request_id, skfs} ->
        :persistent_term.erase(request_id)
        update_fun = fn device ->
          case Map.get(skfs, device.id, :nil) do
            :nil ->
              device
            skf ->
              Map.merge(device, skf)
          end
        end
        render(conn, "index.json", devices: Enum.map(parsed_devices, update_fun))
    after
      2_000 ->
        :persistent_term.erase(request_id)
        render(conn, "index.json", devices: parsed_devices)
    end
  end

  def show(conn, %{ "id" => id }) do
    with {:ok, _id} <- Ecto.UUID.dump(id) do
      current_organization = conn.assigns.current_organization

      request_id = for _ <- 1..10, into: "", do: <<Enum.random('0123456789abcdef')>>
      :persistent_term.put(request_id, self())
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:skf", %{"devices" => [id], "request_id" => request_id})

      case Devices.get_device(current_organization, id)
        |> Repo.preload([[labels: :config_profile], :config_profile])
      do
        nil ->
          :persistent_term.erase(request_id)
          {:error, :not_found, "Device not found"}
        %Device{} = device ->
          receive do
            {:skf, request_id, skfs} ->
              :persistent_term.erase(request_id)
              case Map.get(skfs, id, :nil) do
                :nil ->
                  render(conn, "show.json", device: put_config_settings_on_device(device))
                skf ->
                  render(conn, "show.json", device: put_config_settings_on_device(Map.merge(device, skf)))
              end
          after
            2_000 ->
              :persistent_term.erase(request_id)
              render(conn, "show.json", device: put_config_settings_on_device(device))
          end
      end
    else
      :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
    end
  end

  def update(conn, %{ "id" => id, "config_profile_id" => profile_id }) do
    cond do
      Ecto.UUID.dump(id) == :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
      not is_nil(profile_id) and Ecto.UUID.dump(profile_id) == :error ->
        {:error, :bad_request, "config_profile_id param must be a valid UUID"}
      true ->
        current_organization = conn.assigns.current_organization

        case Devices.get_device(current_organization, id) do
          nil ->
            {:error, :not_found, "Device not found"}
          %Device{} = device ->
            if profile_id == nil do
              with {:ok, device} <- Devices.update_device(device, %{ config_profile_id: nil }) do
                device = device |> Repo.preload([[labels: :config_profile], :config_profile])
                broadcast_router_update_device(device)

                render(conn, "show.json", device: put_config_settings_on_device(device))
              end
            else
              config_profile = ConfigProfiles.get_config_profile(current_organization, profile_id)
              case config_profile do
                nil ->
                  {:error, :not_found, "Config Profile not found"}
                _ ->
                  with {:ok, device} <- Devices.update_device(device, %{ config_profile_id: config_profile.id }) do
                    device = device |> Repo.preload([[labels: :config_profile], :config_profile])
                    broadcast_router_update_device(device)

                    render(conn, "show.json", device: put_config_settings_on_device(device))
                  end
              end
            end
        end
    end
  end

  def update(conn, %{ "id" => id, "active" => active }) do
    with {:ok, _id} <- Ecto.UUID.dump(id) do
      current_organization = conn.assigns.current_organization

      case Devices.get_device(current_organization, id) do
        nil ->
          {:error, :not_found, "Device not found"}
        %Device{} = device ->
          with {:ok, device} <- Devices.update_device(device, %{ active: active }) do
            device = device |> Repo.preload([[labels: :config_profile], :config_profile])
            broadcast_router_update_device(device)

            render(conn, "show.json", device: put_config_settings_on_device(device))
          end
      end
    else
      :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
    end
  end

  def delete(conn, %{ "id" => id } = attrs) do
    with {:ok, _id} <- Ecto.UUID.dump(id) do
      current_organization = conn.assigns.current_organization

      case Devices.get_device(current_organization, id) |> Repo.preload([:labels]) do
        nil ->
          {:error, :not_found, "Device not found"}
        %Device{} = device ->
          # grab info for notifications before device(s) deletion
          deleted_device = %{ device_id: id, labels: Enum.map(device.labels, fn l -> l.id end), device_name: device.name }

          with {:ok, _} <- Devices.delete_device(device) do
            broadcast_router_delete_device(device)

            { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
            details = %{
              device_name: deleted_device.device_name,
              deleted_by: "v1 API",
              time: time
            }

            AlertEvents.delete_unsent_alert_events_for_device(deleted_device.device_id)
            AlertEvents.notify_alert_event(deleted_device.device_id, "device", "device_deleted", details, deleted_device.labels)
            Alerts.delete_alert_nodes(deleted_device.device_id, "device")

            AuditActions.create_audit_action(
              current_organization.id,
              "v1_api",
              "device_controller_delete",
              deleted_device.device_id,
              attrs
            )

            conn
            |> send_resp(:ok, "Device deleted")
          end
      end
    else
      :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
    end
  end

  def create(conn, device_params = %{ "name" => _name, "dev_eui" => _dev_eui, "app_eui" => _app_eui, "app_key" => _app_key } = attrs) do
    if Application.get_env(:console, :socket_check_origin) == "https://console.helium.com" do
      {:error, :forbidden, "Action not allowed on Helium Foundation Console"}
    else
      current_organization = conn.assigns.current_organization
      device_params =
        Map.merge(device_params, %{
          "organization_id" => current_organization.id,
          "oui" => Application.fetch_env!(:console, :oui)
        })
        |> Map.drop(["hotspot_address"]) # prevent accidental creation of discovery mode device

      result =
        Ecto.Multi.new()
        |> Ecto.Multi.run(:labels, fn _repo, _ ->
          label_ids = Map.get(device_params, "label_ids", nil)
          if label_ids != nil do
            labels = Labels.get_labels(current_organization, label_ids)

            if length(labels) == length(label_ids) do
              {:ok, labels}
            else
              {:error, "Could not find all attached label ids in organization"}
            end
          else
            {:ok, nil}
          end
        end)
        |> Ecto.Multi.run(:config_profile, fn _repo, _ ->
          profile_id = Map.get(device_params, "config_profile_id", nil)
          if profile_id != nil do
            config_profile = ConfigProfiles.get_config_profile(current_organization, profile_id)
            if config_profile != nil do
              {:ok, config_profile}
            else
              {:error, "Could not find config_profile in organization"}
            end
          else
            {:ok, nil}
          end
        end)
        |> Ecto.Multi.run(:device, fn _repo, %{ config_profile: config_profile } ->
          device_attrs =
            if config_profile != nil do
              device_params
            else
              device_params |> Map.drop(["config_profile_id"])
            end
          Devices.create_device(device_attrs, current_organization)
        end)
        |> Ecto.Multi.run(:add_labels, fn _repo, %{ device: device, labels: labels } ->
          if labels == nil do
            {:ok, "No labels to attach"}
          else
            add_labels_result =
              labels
              |> Enum.map(fn l -> l.id end)
              |> Labels.add_labels_to_device(device, current_organization)
            case add_labels_result do
              {:ok, _, _} -> {:ok, "Successfully added to labels"}
              _ -> {:error, "Could not add all labels to device, please try creating device again"}
            end
          end
        end)
        |> Repo.transaction()

      case result do
        {:ok, %{ device: device }} ->
          broadcast_router_add_device(device)

          device =
            Devices.get_device!(current_organization, device.id)
            |> Repo.preload([[labels: :config_profile], :config_profile])

          AuditActions.create_audit_action(
            current_organization.id,
            "v1_api",
            "device_controller_create",
            device.id,
            attrs
          )

          conn
          |> put_status(:created)
          |> render("show.json", device: put_config_settings_on_device(device))
        {:error, _, error = %Ecto.Changeset{}, _} ->
          {:error, error}
        {:error, _, error, _} ->
          {:error, :bad_request, error}
        {:error, "Device limit reached"} ->
          {:error, :forbidden, "The device/organization cap has been met. To add devices or organizations for commercial use cases, check docs for Console Hosting Providers."}
        {:error, error} ->
          {:error, :bad_request, error}
      end
    end
  end

  @doc """
  Batch device creation, limited to 1,000 per request
  Using a stream to transparently parallelize the inserts over all CPU cores
  and every operation is independent and isolated.
  """
  def create(conn, %{ "devices" => devices }) when is_list(devices) do
    current_org = conn.assigns.current_organization
    num_devices_to_add = length(devices)
    num_existing_devices = Devices.get_organization_device_count(current_org)
    hard_cap = Application.get_env(:console, :max_devices_in_org)

    cond do
      Application.get_env(:console, :socket_check_origin) == "https://console.helium.com" ->
        {:error, :forbidden, "Action not allowed on Helium Foundation Console"}
      Application.get_env(:console, :impose_hard_cap) == true and num_devices_to_add > hard_cap - num_existing_devices ->
        {:error, :forbidden, "Failed to create devices. Adding #{num_devices_to_add} would surpass hard cap of #{hard_cap}. You may add up to #{hard_cap - num_existing_devices} devices."}
      true ->
        cond do
          length(devices) == 0 ->
            {:error, :bad_request, "Must create at least one device."}
          length(devices) > 1000 ->
            {:error, :bad_request, "Batch limit of 1,000 devices exceeded. Please try again with a smaller batch size."}
          length(devices) <= 1000 ->
            current_organization = conn.assigns.current_organization

            device_attrs =
              Enum.map(devices, fn device_params ->
                Map.merge(device_params, %{
                  "organization_id" => current_organization.id,
                  "oui" => Application.fetch_env!(:console, :oui)
                })
                |> Map.drop(["hotspot_address"]) # prevent accidental creation of discovery mode device
              end)

            stream = Task.async_stream(device_attrs, fn d ->
              result =
                Ecto.Multi.new()
                |> Ecto.Multi.run(:labels, fn _repo, _ ->
                  label_ids = Map.get(d, "label_ids", nil)
                  if label_ids != nil do
                    labels = Labels.get_labels(current_organization, label_ids)

                    if length(labels) == length(label_ids) do
                      {:ok, labels}
                    else
                      {:error, "Could not find all attached label ids in organization"}
                    end
                  else
                    {:ok, nil}
                  end
                end)
                |> Ecto.Multi.run(:config_profile, fn _repo, _ ->
                  profile_id = Map.get(d, "config_profile_id", nil)
                  if profile_id != nil do
                    config_profile = ConfigProfiles.get_config_profile(current_organization, profile_id)
                    if config_profile != nil do
                      {:ok, config_profile}
                    else
                      {:error, "Could not find config_profile in organization"}
                    end
                  else
                    {:ok, nil}
                  end
                end)
                |> Ecto.Multi.run(:device, fn _repo, %{ config_profile: config_profile } ->
                  device_attrs =
                    if config_profile != nil do
                      d
                    else
                      d |> Map.drop(["config_profile_id"])
                    end
                  Devices.create_device(device_attrs, current_organization)
                end)
                |> Ecto.Multi.run(:add_labels, fn _repo, %{ device: device, labels: labels } ->
                  if labels == nil do
                    {:ok, "No labels to attach"}
                  else
                    add_labels_result =
                      labels
                      |> Enum.map(fn l -> l.id end)
                      |> Labels.add_labels_to_device(device, current_organization)
                    case add_labels_result do
                      {:ok, _, _} -> {:ok, "Successfully added to labels"}
                      _ -> {:error, "Could not add all labels to device, please try creating device again"}
                    end
                  end
                end)
                |> Repo.transaction()

              case result do
                {:ok, %{ device: device }} ->
                  broadcast_router_add_device(device)

                  device =
                    Devices.get_device!(current_organization, device.id)
                    |> Repo.preload([[labels: :config_profile], :config_profile])

                  AuditActions.create_audit_action(
                    current_organization.id,
                    "v1_api",
                    "device_controller_batch_create",
                    device.id,
                    d
                  )

                  {:ok, put_config_settings_on_device(device)}
                {:error, _, error = %Ecto.Changeset{}, _} ->
                  {:error, error}
                {:error, _, error, _} ->
                  {:error, d, error}
                {:error, "Device limit reached"} ->
                  {:error, d, "The device/organization cap has been met. To add devices or organizations for commercial use cases, check docs for Console Hosting Providers."}
                {:error, error} ->
                  {:error, d, error}
              end
            end, max_concurrency: 10)

            results = Enum.reduce(Enum.to_list(stream), %{ success: [], failure: [] }, fn {_, result}, acc ->
              case result do
                {:ok, device} ->
                  short_device = %{
                    id: device.id,
                    name: device.name,
                    dev_eui: device.dev_eui,
                    app_eui: device.app_eui,
                    app_key: device.app_key,
                    config_profile_id: device.config_profile_id,
                    labels: Enum.map(device.labels, fn l -> %{ id: l.id, name: l.name } end)
                  }
                  %{
                    success: [short_device | acc.success],
                    failure: acc.failure
                  }
                {:error, %Ecto.Changeset{valid?: false, changes: changes, errors: errors}} ->
                  %{
                    success: acc.success,
                    failure: [Map.put(changes, :error,"#{elem(List.first(errors), 0)}: #{elem(elem(List.first(errors), 1), 0)}") | acc.failure]
                  }
                {:error, attrs, error} ->
                  %{
                    success: acc.success,
                    failure: [Map.put(attrs, :error, error) | acc.failure]
                  }
              end
            end)

            render(conn, "results.json", results: results)
        end
    end
  end

  def set_devices_active(conn, %{"app_key" => app_key, "dev_eui" => dev_eui, "app_eui" => app_eui, "active" => active}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_device_attrs(dev_eui, app_eui, app_key, current_organization.id)

    case length(devices) do
      0 ->
        {:error, :not_found, "Device not found"}
      _ ->
        device = List.first(devices)
        with {:ok, device} <- Devices.update_device(device, %{ active: active }) do
          device = device |> Repo.preload([[labels: :config_profile], :config_profile])
          broadcast_router_update_device(device)

          render(conn, "show.json", device: put_config_settings_on_device(device))
        end
    end
  end

  def set_devices_active(conn, %{"dev_eui" => dev_eui, "app_eui" => app_eui, "active" => active}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_dev_eui_app_eui(current_organization, dev_eui, app_eui)

    case length(devices) do
      0 ->
        {:error, :not_found, "Devices not found"}
      _ ->
        device_ids = Enum.map(devices, fn d -> d.id end)
        with {_, nil} <- Devices.update_devices_active(device_ids, active, current_organization) do
          parsed_devices =
            Devices.get_devices(current_organization, device_ids)
            |> Repo.preload([[labels: :config_profile], :config_profile])
            |> Enum.map(fn d -> put_config_settings_on_device(d) end)

          Enum.each(parsed_devices, fn d -> broadcast_router_update_device(d) end)

          render(conn, "index.json", devices: parsed_devices)
        end
    end
  end

  def set_devices_active(conn, %{"dev_eui" => dev_eui, "active" => active}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_dev_eui(current_organization, dev_eui)

    case length(devices) do
      0 ->
        {:error, :not_found, "Devices not found"}
      _ ->
        device_ids = Enum.map(devices, fn d -> d.id end)
        with {_, nil} <- Devices.update_devices_active(device_ids, active, current_organization) do
          parsed_devices =
            Devices.get_devices(current_organization, device_ids)
            |> Repo.preload([[labels: :config_profile], :config_profile])
            |> Enum.map(fn d -> put_config_settings_on_device(d) end)

          Enum.each(parsed_devices, fn d -> broadcast_router_update_device(d) end)

          render(conn, "index.json", devices: parsed_devices)
        end
    end
  end

  def get_events(conn, params = %{ "device_id" => device_id }) do
    with {:ok, _id} <- Ecto.UUID.dump(device_id) do
      current_organization = conn.assigns.current_organization

      case Devices.get_device(current_organization, device_id) do
        nil ->
          {:error, :not_found, "Device not found"}
        %Device{} = device ->
          events =
            case params["sub_category"] do
              nil -> Events.get_device_last_events(device.id, 100)
              sub_category -> Events.get_device_last_events(device.id, 10, sub_category)
            end
          device = Map.put(device, :events, events)

          render(conn, "show_events.json", device: device)
      end
    else
      :error ->
        {:error, :bad_request, "device_id param must be a valid UUID"}
    end
  end

  def discover_device(conn, _params = %{ "hotspot_name" => name, "hotspot_address" => address, "transaction_id" => transaction_id, "signature" => signature }) do
    current_organization = conn.assigns.current_organization
    discovery_mode_organization = Organizations.get_discovery_mode_org()
    if current_organization.id !== discovery_mode_organization.id do
      {:error, :forbidden, "Request must come from Discovery Mode (Helium) organization"}
    else
      existing_device = Devices.get_device_for_hotspot_address(address)
      if existing_device == nil do
        with {:ok, %Device{} = device} <- Devices.create_discovery_device(%{ "name" => name, "hotspot_address" => address, "organization_id" => current_organization.id }) do
          discovery_mode_label = Labels.get_label_by_name("Discovery Mode", discovery_mode_organization.id)
          Labels.add_devices_to_label([device.id], discovery_mode_label.id, current_organization)
          ConsoleWeb.Endpoint.broadcast("device:all", "device:all:discover:devices", %{ "hotspot" => address, "transaction_id" => transaction_id, "signature" => signature, "device_id" => device.id })
          conn
            |> send_resp(:ok, "Device created and broadcasted to router")
        end
      else
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:discover:devices", %{ "hotspot" => address, "transaction_id" => transaction_id, "signature" => signature, "device_id" => existing_device.id })
        conn
          |> send_resp(:ok, "Device broadcasted to router")
      end
    end
  end

  defp broadcast_router_add_device(%Device{} = device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:add:devices", %{ "devices" => [device.id] })
  end

  defp broadcast_router_delete_device(%Device{} = device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:delete:devices", %{ "devices" => [device.id] })
  end

  defp broadcast_router_update_device(%Device{} = device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => [device.id] })
  end

  defp put_config_settings_on_device(device) do
    adr_allowed =
      case device.config_profile do
        nil -> nil
        _ -> device.config_profile.adr_allowed
      end

    cf_list_enabled =
      case device.config_profile do
        nil -> nil
        _ -> device.config_profile.cf_list_enabled
      end

    rx_delay =
      case device.config_profile do
        nil -> 1
        _ -> device.config_profile.rx_delay
      end

    Map.merge(device, %{ cf_list_enabled: cf_list_enabled, adr_allowed: adr_allowed, rx_delay: rx_delay })
  end
end
