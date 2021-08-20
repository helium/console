defmodule Console.Hotspots.HotspotResolver do
  alias Console.Hotspots

  def show(%{ address: address }, _) do
    hotspot = Hotspots.get_hotspot!(address)

    attrs = %{ hotspot_name: hotspot.name, hotspot_address: hotspot.address }
    {:ok, Map.merge(hotspot, attrs) }
  end
end
