defmodule ConsoleWeb.Plug.PutCurrentUser do
  import Plug.Conn, only: [assign: 3]
  import Console.Auth, only: [get_user_by_id: 1]
  alias Console.Auth.User

  def init(default), do: default

  def call(conn, _default) do
    # Swap out to get necessary user information here
    unprefixed_user_id = String.replace(conn.assigns[:user_id], "auth0|", "")
    email = conn.assigns[:email]
    case get_user_by_id(unprefixed_user_id) do
      {:super} -> assign(conn, :current_user, get_user_data_map(unprefixed_user_id, email, :super))
      _ -> assign(conn, :current_user, get_user_data_map(unprefixed_user_id, email))
    end
  end

  defp get_user_data_map(user_id, user_email, super_user \\ false) do
    %User{id: user_id, super: super_user, email: user_email}
  end
end
