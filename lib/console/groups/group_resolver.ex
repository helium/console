defmodule Console.Groups.GroupResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Absinthe.Relay.Connection

  def connection(pagination_args, %{source: device}) do
    Ecto.assoc(device, :groups)
    |> Connection.from_query(&Repo.all/1, pagination_args)
  end
end
