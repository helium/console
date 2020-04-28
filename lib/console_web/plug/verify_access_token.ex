defmodule ConsoleWeb.Plug.VerifyAccessToken do
  import Plug.Conn
  require Logger

  def init(default), do: default

  def call(conn, _default) do
    auth_header = conn |> get_req_header("authorization") |> List.first()
    response = HTTPoison.get!("#{Application.get_env(:console, :auth0)[:app_baseurl]}/.well-known/jwks.json")
    key = Poison.decode!(response.body)
    head = Enum.at(key["keys"], 0)
    signer = Joken.Signer.create("RS256", head)
    passed_token = String.replace(auth_header, "Bearer ", "")
    {:ok, data} = Joken.verify(passed_token, signer)
    conn
    |> assign(:user_id, data["sub"])
    |> assign(:email, data["email"])
  end
end
