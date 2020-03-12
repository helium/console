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
          conn
          |> send_resp(:ok, "Device deleted")
        end
    end
  end

  def create(conn, %{ "device" => device_params }) do
    current_organization = conn.assigns.current_organization
    device_params =
      Map.merge(device_params, %{
        "organization_id" => current_organization.id,
        "oui" => Application.fetch_env!(:console, :oui)
      })

    with {:ok, %Device{} = device} <- Devices.create_device(current_organization, device_params) do
      conn
      |> put_status(:created)
      |> render("show.json", device: device)
    end
  end
end
