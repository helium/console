defmodule ConsoleWeb.PacketConfigView do
  use ConsoleWeb, :view
  alias ConsoleWeb.PacketConfigView

  def render("show.json", %{packet_config: packet_config}) do
    render_one(packet_config, PacketConfigView, "packet_config.json")
  end

  def render("packet_config.json", %{packet_config: packet_config}) do
    %{
      id: packet_config.id,
      name: packet_config.name,
      organization_id: packet_config.organization_id,
      multi_buy_value: packet_config.multi_buy_value,
      multi_active: packet_config.multi_active,
      preferred_active: packet_config.preferred_active
    }
  end
end
