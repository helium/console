defmodule Console.Groups.GroupResolver do
  import Ecto.Query, warn: false

  alias Console.Repo

  def find(_, %{source: resource}) do
    groups =
      Ecto.assoc(resource, :groups)
      |> Repo.all()
    {:ok, groups}
  end
end
