defmodule ConsoleWeb.Plug.AuthorizeAction do
  import Plug.Conn, only: [send_resp: 3, halt: 1]
  import ConsoleWeb.Abilities

  def init(default), do: default

  def call(conn, _default) do
    current_membership = conn.assigns.current_membership
    action = conn.private.phoenix_action
    item = nil # TODO if there are any abilities that require access to the
               # current resource, it can be plugged in prior to this plug

    if can?(current_membership, action, item) do
      conn
    else
      conn
      |> send_resp(
        :forbidden,
        Poison.encode!(%{
          type: "forbidden_action",
          errors: ["You don't have access to do this"]
        })
      )
      |> halt()
    end
  end
end
