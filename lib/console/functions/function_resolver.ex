defmodule Console.Functions.FunctionResolver do
  alias Console.Repo
  alias Console.Functions.Function
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    functions = Function
      |> where([f], f.organization_id == ^current_organization.id)
      |> order_by(desc: :inserted_at)
      |> preload([labels: [:channels]])
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, functions}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    function = Function
      |> where([f], f.id == ^id and f.organization_id == ^current_organization.id)
      |> Repo.one!()

    {:ok, function}
  end
end
