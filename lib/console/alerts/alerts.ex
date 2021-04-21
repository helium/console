defmodule Console.Alerts do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.Alert
  
  def get_alert!(id), do: Repo.get!(Alert, id)
  def get_alert(id), do: Repo.get(Alert, id)

  def create_alert(attrs \\ %{}) do
    %Alert{}
    |> Alert.changeset(attrs)
    |> Repo.insert()
  end
end