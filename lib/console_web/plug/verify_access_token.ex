defmodule ConsoleWeb.AccessTokenDecoder do
  @callback decode_conn_access_token(Plug.Conn.t()) :: :error | %{user_id: String.t(), email: String.t()}
end

defmodule ConsoleWeb.AccessTokenDecoder.Auth0 do
  @behaviour ConsoleWeb.AccessTokenDecoder
  import Plug.Conn

  def decode_conn_access_token(conn) do
    auth_header = conn |> get_req_header("authorization") |> List.first()
    response = HTTPoison.get!("#{Application.get_env(:console, :auth0)[:app_baseurl]}/.well-known/jwks.json")
    key = Poison.decode!(response.body)
    head = Enum.at(key["keys"], 0)
    signer = Joken.Signer.create("RS256", head)
    passed_token = String.replace(auth_header, "Bearer ", "")
    case Joken.verify(passed_token, signer) do
      {:ok, %{"email" => email, "sub" => sub}} -> %{email: email, user_id: sub}
      _ -> :error
    end

  end
end

defmodule ConsoleWeb.Plug.VerifyAccessToken do
  require Logger
  import Plug.Conn
  @access_token_decoder Application.get_env(:console, :access_token_decoder)

  def init(default), do: default

  def call(conn, _default) do
    case @access_token_decoder.decode_conn_access_token(conn) do
      %{user_id: user_id, email: email} ->
        conn
          |> assign(:user_id, user_id)
          |> assign(:email, email)
      :error ->
        conn
        |> send_resp(
          :forbidden,
          Poison.encode!(%{
            type: "forbidden",
            errors: ["Could not validate your credentials"]
          })
        )
        |> halt()
    end

  end
end
