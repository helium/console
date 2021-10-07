defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller
  import ConsoleWeb.AuthErrorHandler

  def create(conn, _) do
    did_token =
      conn
      |> get_req_header("authorization")
      |> List.first()
      |> String.replace("Bearer ", "")

    with true <- Magic.Token.validate!(did_token) do
      issuer = Magic.Token.get_issuer(did_token)
      header = ["X-Magic-Secret-Key": Application.get_env(:console, :magic_secret_key)]
      response =
        "https://api.magic.link/v1/admin/auth/user/get?issuer=#{issuer}"
          |> URI.encode()
          |> HTTPoison.get!(header)
          |> Map.get(:body)
          |> Poison.decode!()

      with %{ "status" => "ok", "data" => user_metadata } <- response do
        with {:ok, token, claims} <-
          ConsoleWeb.Guardian.encode_and_sign(
            %{ id: user_metadata["issuer"] },
            %{
              email: user_metadata["email"],
              typ: "magic-auth-session",
            },
            ttl: {1, :day}
          )
        do
          conn
          |> put_status(:created)
          |> render("show.json", jwt: token, claims: claims)
        end
      end
    end
  end
end
