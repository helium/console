defmodule ConsoleWeb.Plug.GraphqlContext do
  @behaviour Plug

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  @doc """
  Return the current user context based on the authorization header
  """
  def build_context(conn) do
    %{
      current_user: conn.assigns.current_user,
      current_team: conn.assigns.current_team,
      current_membership: conn.assigns.current_membership
    }
  end
end
