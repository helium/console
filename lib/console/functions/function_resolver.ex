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

    entries = functions.entries
      |> Enum.map(fn f ->
        labels = Enum.map(f.labels, fn l ->
          Map.put(l, :channels,
            Enum.map(l.channels, fn c ->
              Map.drop(c, [:downlink_token])
            end)
          )
        end)

        channels =
          Enum.map(f.labels, fn l ->
            l.channels
          end)
          |> List.flatten()
          |> Enum.uniq()
          |> Enum.map(fn c ->
            Map.drop(c, [:downlink_token])
          end)

        Map.put(f, :channels, channels)
        |> Map.put(:labels, labels)
      end)

    {:ok, Map.put(functions, :entries, entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    function = Function
      |> where([f], f.id == ^id and f.organization_id == ^current_organization.id)
      |> preload([labels: [:channels, :function]])
      |> Repo.one!()

    function = function
      |> Map.put(:labels,
        Enum.map(function.labels, fn l ->
          Map.put(l, :channels,
            Enum.map(l.channels, fn c ->
              Map.drop(c, [:downlink_token])
            end)
          )
        end)
      )

    {:ok, function}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    functions = Ecto.assoc(current_organization, :functions) |> Repo.all()
    {:ok, functions}
  end
end
