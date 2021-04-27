defmodule Console.Alerts.AlertResolver do
  alias Console.Repo
  alias Console.Alerts.Alert
  alias Console.Alerts.AlertNodes
  import Ecto.Query

  def all(_, %{context: %{current_organization: current_organization}}) do
    alerts = Alert
      |> where([a], a.organization_id == ^current_organization.id)
      |> Repo.all()

    {:ok, alerts}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    alert = Alert
      |> where([a], a.id == ^id and a.organization_id == ^current_organization.id)
      |> Repo.one!()

    {:ok, alert}
  end

  def get_per_type(%{type: type}, %{context: %{current_organization: current_organization}}) do
    alerts = Alert
      |> where([a], a.organization_id == ^current_organization.id and a.node_type == ^type)
      |> Repo.all()

    {:ok, alerts}
  end

  def get_alerts_for_node(%{node_id: node_id, node_type: node_type}, %{context: %{current_organization: current_organization}}) do
    query = from a in Alert,
      join: an in AlertNodes,
      on: an.alert_id == a.id,
      where: a.organization_id == ^current_organization.id and an.node_id == ^node_id and an.node_type == ^node_type
    
    {:ok, Repo.all(query)}
  end
end
