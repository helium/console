defmodule ConsoleWeb.AccessTokenDecoder do
  @callback decode_conn_access_token(String.t()) :: :error | %{user_id: String.t(), email: String.t()}
end

defmodule ConsoleWeb.AccessTokenDecoder.Auth0 do
  @behaviour ConsoleWeb.AccessTokenDecoder

  def decode_conn_access_token(token) do
    case Application.get_env(:console, :auth0_jwk) do
      nil ->
        response = HTTPoison.get!("#{Application.get_env(:console, :auth0_baseurl)}/.well-known/jwks.json")
        key = Poison.decode!(response.body)
        jwk = Enum.at(key["keys"], 0)
        Application.put_env(:console, :auth0_jwk, jwk)
        jwk
        |> verify_token_with_signer(token)
      jwk ->
        jwk
        |> verify_token_with_signer(token)
    end

  end

  defp verify_token_with_signer(jwk, token) do
    signer = Joken.Signer.create("RS256", jwk)
    case verify_token_with_email_verified(token, signer) do
      {:ok, %{"email" => email, "sub" => sub}} ->
        unprefixed_user_id = String.replace(sub, "auth0|", "")
        %{email: email, user_id: unprefixed_user_id, auth0_id: sub}
      _ ->
        :error
    end
  end

  defp verify_token_with_email_verified(token, signer) do
    %{}
      |> Joken.Config.add_claim("email_verified", nil, &(&1 == true))
      |> Joken.verify_and_validate(token, signer)
  end
end

defmodule ConsoleWeb.Plug.VerifyAccessToken do
  require Logger
  import Plug.Conn
  @access_token_decoder Application.get_env(:console, :access_token_decoder)

  def init(default), do: default

  def call(conn, _default) do
    auth_header = conn |> get_req_header("authorization")
    
    cond do
      auth_header == nil or List.first(auth_header) == nil ->
        conn
          |> send_resp(
            :forbidden,
            Poison.encode!(%{
              type: "forbidden",
              errors: ["Authorization header is missing"]
            })
          )
          |> halt()
      true ->
        if Application.get_env(:console, :use_magic_auth) do
          token =
            conn
            |> get_req_header("authorization")
            |> List.first()
            |> String.replace("Bearer ", "")

          case ConsoleWeb.Guardian.decode_and_verify(token) do
            {:ok, %{ "typ" => "magic-auth-session", "sub" => user_id, "email" => email }} ->
              conn
                |> assign(:user_id, user_id)
                |> assign(:email, email)
            _ ->
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
        else
          token = conn
          |> get_req_header("authorization")
          |> List.first()
          |> String.replace("Bearer ", "")

          case @access_token_decoder.decode_conn_access_token(token) do
            %{user_id: user_id, email: email, auth0_id: auth0_id} ->
              conn
                |> assign(:user_id, user_id)
                |> assign(:email, email)
                |> assign(:auth0_id, auth0_id)
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
  end
end
