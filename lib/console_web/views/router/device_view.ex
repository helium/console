defmodule ConsoleWeb.Router.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.DeviceView
  alias ConsoleWeb.Router.ChannelView

  def render("index.json", %{devices: devices}) do
    render_many(devices, DeviceView, "device.json")
  end

  def render("show.json", %{device: device}) do
    render_one(device, DeviceView, "device.json")
  end

  def render("device.json", %{device: device}) do
    key = device.key
      |> String.split(", ")
      |> Enum.map(fn x -> x |> String.slice(2,3) |> to_charlist() |> List.to_integer(16) end)
      |> :erlang.list_to_binary()
      |> :base64.encode

    %{
      id: device.id,
      name: device.name,
      mac: device.mac,
      team_id: device.team_id,
      key: key
    }
    |> ChannelView.append_channels(device.channels)
  end
end
