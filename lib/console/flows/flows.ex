defmodule Console.Flows do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Flows.Flow

  def get_flows(organization_id) do
     from(f in Flow, where: f.organization_id == ^organization_id)
     |> Repo.all()
  end

  def create_flow(attrs \\ %{}) do
    %Flow{}
    |> Flow.changeset(attrs)
    |> Repo.insert()
  end

  def delete_flow(%Flow{} = flow) do
    Repo.delete(flow)
  end
end
