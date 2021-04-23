defmodule Console.Alerts.AlertResolver do
  alias Console.Repo
  alias Console.Alerts.Alert
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
end
