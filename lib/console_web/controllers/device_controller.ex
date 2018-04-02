defmodule ConsoleWeb.DeviceController do
  use ConsoleWeb, :controller

  alias Console.Devices
  alias Console.Devices.Device

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_team = conn.assigns.current_team
                   |> Console.Teams.fetch_assoc([:devices])
    render(conn, "index.json", devices: current_team.devices)
  end

  def create(conn, %{"device" => device_params}) do
    current_team = conn.assigns.current_team
    device_params = Map.merge(device_params, %{"team_id" => current_team.id})
    with {:ok, %Device{} = device} <- Devices.create_device(device_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", device_path(conn, :show, device))
      |> render("show.json", device: device)
    end
  end

  def show(conn, %{"id" => id}) do
    device = Devices.get_device!(id) |> Devices.fetch_assoc()
    render(conn, "show.json", device: device)
  end

  def update(conn, %{"id" => id, "device" => device_params}) do
    device = Devices.get_device!(id)

    with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do
      render(conn, "show.json", device: device)
    end
  end

  def delete(conn, %{"id" => id}) do
    device = Devices.get_device!(id)
    with {:ok, %Device{}} <- Devices.delete_device(device) do
      send_resp(conn, :no_content, "")
    end
  end
end
