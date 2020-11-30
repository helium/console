defmodule ConsoleWeb.Plug.GraphqlContext do
  @behaviour Plug

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _) do
    query = Map.get(conn.body_params, "query")
    if String.contains?(query, "__schema") do
      conn
      |> send_resp(
        :forbidden,
        Poison.encode!(%{
          type: "forbidden_action",
          errors: ["Forbidden action on console graphql"]
        })
      )
      |> halt()
    else
      context = build_context(conn)
      Absinthe.Plug.put_options(conn, context: context)
    end
  end

  @doc """
  Return the current user context based on the authorization header
  """
  def build_context(conn) do
    %{
      current_user: conn.assigns.current_user,
      current_organization: conn.assigns.current_organization,
      current_membership: conn.assigns.current_membership
    }
  end
end
