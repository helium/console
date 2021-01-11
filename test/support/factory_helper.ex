defmodule Console.FactoryHelper do
  import Plug.Conn
  import Phoenix.ConnTest
  import Console.Factory
  import ConsoleWeb.Guardian

  alias Console.Organizations

  def authenticate_user(%{conn: conn}) do
    user = params_for(:user)
    {:ok, organization} = Organizations.create_organization(user, params_for(:organization))
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", user.id <> " " <> user.email)
           |> put_req_header("organization", organization.id)
    {:ok, conn: conn}
  end
end
