defmodule ConsoleWeb.V1.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query

  alias Console.Organizations
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

    with {:ok, %Device{} = device} <- Devices.create_device(device_params, current_organization) do
      conn
      |> put_status(:created)
      |> render("show.json", device: device)
    end
  end

  defp broadcast_router_update_devices(%Device{} = device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => [device.id] })
  end
end
