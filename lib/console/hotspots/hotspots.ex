defmodule Console.Hotspots do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Hotspots.Hotspot

  def get_hotspot!(address), do: Repo.get_by!(Hotspot, [address: address])
  def get_hotspot(address), do: Repo.get_by(Hotspot,[address: address])

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