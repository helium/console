defmodule ConsoleWeb.V1.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query

  alias Console.Organizations
  alias Console.Labels
  alias Console.Devices
  alias Console.Devices.Device
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, %{"app_key" => app_key, "dev_eui" => dev_eui, "app_eui" => app_eui}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_device_attrs(dev_eui, app_eui, app_key, current_organization.id)

    case length(devices) do
      0 ->
        {:error, :not_found, "Device not found"}
      _ ->
        render(conn, "show.json", device: List.first(devices))
    end
  end

  def index(conn, %{"dev_eui" => dev_eui}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_dev_eui(dev_eui)

    case length(devices) do
      0 ->
        {:error, :not_found, "Devices not found"}
      _ ->
        render(conn, "index.json", devices: devices)
    end
  end

  def index(conn, %{"dev_eui" => dev_eui, "app_eui" => app_eui}) do
    current_organization = conn.assigns.current_organization
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)

    case length(devices) do
      0 ->
        {:error, :not_found, "Devices not found"}
      _ ->
        render(conn, "index.json", devices: devices)
    end
  end

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:devices])

    render(conn, "index.json", devices: current_organization.devices)
  end

  def show(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Devices.get_device(current_organization, id) do
      nil ->
        {:error, :not_found, "Device not found"}
      %Device{} = device ->
        render(conn, "show.json", device: device)
    end
  end

  def delete(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Devices.get_device(current_organization, id) do
      nil ->
        {:error, :not_found, "Device not found"}
      %Device{} = device ->
        with {:ok, _} <- Devices.delete_device(device) do
          broadcast_router_update_devices(device)

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
      |> Map.drop(["hotspot_address"])

    with {:ok, %Device{} = device} <- Devices.create_device(device_params, current_organization) do
      conn
      |> put_status(:created)
      |> render("show.json", device: device)
    end
  end

  def discover_device(conn, params = %{ "hotspot_name" => name, "hotspot_address" => address, "wallet_id" => wallet_id, "signature" => signature }) do
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
          ConsoleWeb.Endpoint.broadcast("device:all", "device:all:discover:devices", %{ "address" => address, "wallet_id" => wallet_id, "signature" => signature, "device_id" => device.id })
          conn
            |> send_resp(:ok, "Device created and broadcasted to router")
        end
      else
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:discover:devices", %{ "address" => address, "wallet_id" => wallet_id, "signature" => signature, "device_id" => existing_device.id })
        conn
          |> send_resp(:ok, "Device broadcasted to router")
      end
    end
  end

  defp broadcast_router_update_devices(%Device{} = device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => [device.id] })
  end
end
