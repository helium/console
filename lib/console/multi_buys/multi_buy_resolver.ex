defmodule Console.MultiBuys.MultiBuyResolver do
  alias Console.Repo
  alias Console.MultiBuys.MultiBuy
  import Ecto.Query

  def all(_, %{context: %{current_organization: current_organization}}) do
    multi_buys = MultiBuy
      |> where([a], a.organization_id == ^current_organization.id)
      |> Repo.all()

    {:ok, multi_buys}
  end

  # def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
  #   alert = MultiBuy
  #     |> where([a], a.id == ^id and a.organization_id == ^current_organization.id)
  #     |> Repo.one!()
  #
  #   {:ok, alert}
  # end
end
