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
end
