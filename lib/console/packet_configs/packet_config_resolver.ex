defmodule Console.PacketConfigs.PacketConfigResolver do
  alias Console.Repo
  alias Console.PacketConfigs.PacketConfig
  import Ecto.Query

  def all(_, %{context: %{current_organization: current_organization}}) do
    packet_configs = PacketConfig
      |> where([a], a.organization_id == ^current_organization.id)
      |> Repo.all()

    {:ok, packet_configs}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    packet_config = PacketConfig
      |> where([a], a.id == ^id and a.organization_id == ^current_organization.id)
      |> Repo.one!()

    {:ok, packet_config}
  end
end