defmodule ConsoleWeb.V1.DeviceController do
  use ConsoleWeb, :controller
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Console.Organizations
  alias Console.Labels
  alias Console.Devices
  alias Console.Devices.Device
  alias Console.Events
  alias Console.Repo
  alias Console.AlertEvents
  alias Console.Alerts
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

  def index(conn, %{"dev_eui" => dev_eui}) do
    devices = Devices.get_by_dev_eui(dev_eui)

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

  def index(conn, %{"dev_eui" => dev_eui, "app_eui" => app_eui}) do
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)

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

    parsed_devices =
      current_organization.devices
      |> Repo.preload([[labels: :config_profile], :config_profile])
      |> Enum.map(fn d -> put_config_settings_on_device(d) end)

    render(conn, "index.json", devices: parsed_devices)
  end

  def show(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Devices.get_device(current_organization, id)
      |> Repo.preload([[labels: :config_profile], :config_profile])
    do
      nil ->
        {:error, :not_found, "Device not found"}
      %Device{} = device ->
        render(conn, "show.json", device: put_config_settings_on_device(device))
    end
  end

  def delete(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Devices.get_device(current_organization, id) |> Repo.preload([:labels]) do
      nil ->
        {:error, :not_found, "Device not found"}
      %Device{} = device ->
        # grab info for notifications before device(s) deletion
        deleted_device = %{ device_id: id, labels: Enum.map(device.labels, fn l -> l.id end), device_name: device.name }

        with {:ok, _} <- Devices.delete_device(device) do
          broadcast_router_update_devices(device)

          { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
          details = %{
            device_name: deleted_device.device_name,
            deleted_by: "v1 API",
            time: time
          }

          AlertEvents.delete_unsent_alert_events_for_device(deleted_device.device_id)
          AlertEvents.notify_alert_event(deleted_device.device_id, "device", "device_deleted", details, deleted_device.labels)
          Alerts.delete_alert_nodes(deleted_device.device_id, "device")

          conn
          |> send_resp(:ok, "Device deleted")
        end
    end
  end

  def create(conn, device_params = %{ "name" => _name, "dev_eui" => _dev_eui, "app_eui" => _app_eui, "app_key" => _app_key }) do
    current_organization = conn.assigns.current_organization
    device_params =
      Map.merge(device_params, %{
        "organization_id" => current_organization.id,
        "oui" => Application.fetch_env!(:console, :oui)
      })
      |> Map.drop(["hotspot_address"]) # prevent accidental creation of discovery mode device

    with {:ok, %Device{} = device} <- Devices.create_device(device_params, current_organization) do
      broadcast_router_update_devices(device)

      device = device |> Repo.preload([[labels: :config_profile], :config_profile])
      conn
      |> put_status(:created)
      |> render("show.json", device: put_config_settings_on_device(device))
    end
  end

  def get_events(conn, params = %{ "device_id" => device_id }) do
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
  end

  def discover_device(conn, _params = %{ "hotspot_name" => name, "hotspot_address" => address, "transaction_id" => transaction_id, "signature" => signature }) do
    current_organization = conn.assigns.current_organization
    discovery_mode_organization = Organizations.get_discovery_mode_org()
    if current_organization.id !== discovery_mode_organization.id do
      {:error, :forbidden, "Request must come from Discovery Mode (Helium) organization"}
    else
      existing_device = Devices.get_device_for_hotspot_address(address)
      if existing_device == nil do
        with {:ok, %Device{} = device} <- Devices.create_device(%{ "name" => name, "hotspot_address" => address, "organization_id" => current_organization.id }, current_organization) do
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

  defp broadcast_router_update_devices(%Device{} = device) do
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
