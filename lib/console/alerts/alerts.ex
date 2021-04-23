defmodule Console.Alerts do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.Alert
  
  def get_alert!(id), do: Repo.get!(Alert, id)
  def get_alert(id), do: Repo.get(Alert, id)

  def get_alert!(organization, id) do
    Repo.get_by!(Alert, [id: id, organization_id: organization.id])
 end

  def create_alert(attrs \\ %{}) do
    %Alert{}
    |> Alert.changeset(attrs)
    |> Repo.insert()
  end

  def delete_alert(%Alert{} = alert) do
    Repo.delete(alert)
  end
end