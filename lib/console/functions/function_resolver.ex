defmodule Console.Functions.FunctionResolver do
  alias Console.Repo
  alias Console.Functions.Function
  import Ecto.Query
  alias Console.Alerts

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    functions = Function
      |> where([f], f.organization_id == ^current_organization.id)
      |> order_by(desc: :inserted_at)
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, functions}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    function = Function
      |> where([f], f.id == ^id and f.organization_id == ^current_organization.id)
      |> Repo.one!()

    {:ok, function}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    functions = Ecto.assoc(current_organization, :functions)
      |> Repo.all()
      |> Enum.map(fn f ->
        Map.put(f, :alerts, Alerts.get_alerts_by_node(f.id, "function"))
      end)

    {:ok, functions}
  end

  def get_names(%{function_ids: function_ids}, %{context: %{current_organization: current_organization}}) do
    query = from f in Function,
      where: f.organization_id == ^current_organization.id and f.id in ^function_ids

    {:ok, query |> Repo.all()}
  end
end
