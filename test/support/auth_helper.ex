defmodule Console.AuthHelper do
  use Phoenix.ConnTest
  import Console.Factory
  import ConsoleWeb.Guardian

  def authenticate_user(%{conn: conn}) do
    user = insert(:user)
    {:ok, token, _} = encode_and_sign(user, %{}, token_type: :access)
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", "bearer: " <> token)
    {:ok, conn: conn}
  end

end
