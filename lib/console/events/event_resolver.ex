defmodule Console.Events.EventResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Absinthe.Relay.Connection

  def connection(pagination_args, %{source: device}) do
    Ecto.assoc(device, :events)
    |> order_by([desc: :reported_at])
    |> Connection.from_query(&Repo.all/1, pagination_args)
  end
end
