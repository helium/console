defmodule Console.Events.EventResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Absinthe.Relay.Connection

  def connection(pagination_args, %{source: device}) do
    Ecto.assoc(device, :events)
    |> order_by([desc: :reported_at])
    |> Connection.from_query(&Repo.all/1, pagination_args)
  end

  def paginate(%{device_id: device_id, page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    device = Ecto.assoc(current_team, :devices) |> Repo.get!(device_id)

    events =
      Ecto.assoc(device, :events)
      |> order_by([desc: :reported_at])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, events}
  end
end
