defmodule ConsoleWeb.Plug.PutCurrentUser do
  import Plug.Conn, only: [assign: 3]
  import Console.Auth, only: [get_user_by_id_and_email: 2]
  alias Console.Auth.User

  def init(default), do: default

  def call(conn, _default) do
    user_id = conn.assigns[:user_id]
    email = conn.assigns[:email]
    with %User{} = user <- get_user_by_id_and_email(user_id, email) do
      assign(conn, :current_user, user)
    end
  end
end
