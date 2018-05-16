defmodule Console.Events.EventResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Console.Events
  alias Console.Events.Event
  alias Absinthe.Relay.Connection

  def connection(pagination_args, %{source: device}) do
    Event
    |> where(device_id: ^device.id)
    |> order_by([desc: :reported_at])
    |> Connection.from_query(&Repo.all/1, pagination_args)
  end
end
