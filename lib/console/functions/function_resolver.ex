defmodule Console.Functions.FunctionResolver do
  alias Console.Repo
  alias Console.Functions.Function
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    functions = Function
      |> where([f], f.organization_id == ^current_organization.id)
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, functions}
  end
end
