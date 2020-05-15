defmodule ConsoleWeb.Plug.AppsignalAbsinthePlug do
  alias Appsignal.Transaction

  def init(_), do: nil

  @path "/graphql"
  def call(%Plug.Conn{request_path: @path, method: "POST"} = conn, _) do
    path = Map.get(conn.body_params, "operationName", @path)
    Transaction.set_action("POST " <> path)
    conn
  end

  def call(conn, _) do
    conn
  end
end
