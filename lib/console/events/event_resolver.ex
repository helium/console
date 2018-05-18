defmodule Console.Events.EventResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Absinthe.Relay.Connection
  alias Console.Events.Event

  def connection(pagination_args, %{source: device}) do
    Ecto.assoc(device, :events)
    |> order_by([desc: :reported_at])
    |> Connection.from_query(&Repo.all/1, pagination_args)
  end

  def paginate(%{device_id: device_id}, context) do
    events =
      Event
      |> where([e], e.device_id == ^device_id)
      |> Repo.paginate(page: 1, page_size: 5)
    IO.inspect(events)
    {:ok, events}
  end
end
