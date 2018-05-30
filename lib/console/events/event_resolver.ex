defmodule Console.Events.EventResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Absinthe.Relay.Connection

  def connection(pagination_args, %{source: device}) do
    Ecto.assoc(device, :events)
    |> order_by([desc: :reported_at])
    |> Connection.from_query(&Repo.all/1, pagination_args)
  end

  def paginate(%{context_id: context_id, page: page, page_size: page_size, context_name: context_name}, %{context: %{current_team: current_team}}) do
    resource = Ecto.assoc(current_team, String.to_atom(context_name)) |> Repo.get!(context_id)

    events =
      Ecto.assoc(resource, :events)
      |> order_by([desc: :reported_at])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, events}
  end
end
