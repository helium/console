defmodule Console.Hotspots do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Hotspots.Hotspot

  def get_hotspot!(address), do: Repo.get_by!(Hotspot, [address: address])
  def get_hotspot(address), do: Repo.get_by(Hotspot,[address: address])

  def get_hotspots(ids) do
     from(h in Hotspot, where: h.address in ^ids)
     |> Repo.all()
  end

  def create_hotspot(attrs \\ %{}) do
    %Hotspot{}
    |> Hotspot.changeset(attrs)
    |> Repo.insert()
  end

  def update_hotspot(%Hotspot{} = hotspot, attrs) do
    hotspot
    |> Hotspot.changeset(attrs)
    |> Repo.update()
  end
end
