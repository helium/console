defmodule ConsoleWeb.DeviceController do
  use ConsoleWeb, :controller

  alias Console.Devices
  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Devices.DevicesChannels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization
      |> Console.Organizations.fetch_assoc([:devices])

    render(conn, "index.json", devices: current_organization.devices)
  end

  def create(conn, %{"device" => device_params}) do
    current_organization = conn.assigns.current_organization
    device_params = Map.merge(device_params, %{"organization_id" => current_organization.id})

    with {:ok, %Device{} = device} <- Devices.create_device(device_params) do
      broadcast(device)

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "#{device.name} created successfully")
      |> render("show.json", device: device)
    end
  end

  def show(conn, %{"id" => id}) do
    device = Devices.get_device!(id)

    render(conn, "show.json", device: device)
  end

  def update(conn, %{"id" => id, "device" => device_params}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(id)

    with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do
      broadcast(device, device.id)

      conn
      |> put_resp_header("message", "#{device.name} updated successfully")
      |> render("show.json", device: device)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(id)

    with {:ok, %Device{} = device} <- Devices.delete_device(device) do
      broadcast(device)

      conn
      |> put_resp_header("message", "#{device.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"devices" => devices}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(List.first(devices))
    length = length(devices)

    with {length, nil} <- Devices.delete_devices(devices) do
      broadcast(device)

      conn
      |> put_resp_header("message", "Devices deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def set_channel(conn, %{"channel" => %{"id" => channel_id}, "device_id" => id}) do
    device = Devices.get_device!(id)
    channel = Channels.get_channel!(channel_id)
    current_organization = conn.assigns.current_organization

    with {:ok, %DevicesChannels{} = device_channel} <- Devices.set_device_channel(device, channel) do
      broadcast(device, device.id)

      conn
      |> put_resp_header("message", "#{device.name} updated channel successfully")
      |> render("show.json", device: device)
    end
  end

  def delete_channel(conn, %{"channel_id" => channel_id, "device_id" => id}) do
    device = Devices.get_device!(id)
    current_organization = conn.assigns.current_organization

    with {:ok, %DevicesChannels{} = device_channel} <- Devices.delete_device_channel(device, channel_id) do
      broadcast(device, device.id)

      conn
      |> put_resp_header("message", "#{device.name} deleted channel successfully")
      |> send_resp(:no_content, "")
    end
  end

  def broadcast(%Device{} = device) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device, device_added: "#{device.organization_id}/device_added")
  end

  defp broadcast(%Device{} = device, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, device, device_updated: "#{device.organization_id}/#{id}/device_updated")
  end
end
