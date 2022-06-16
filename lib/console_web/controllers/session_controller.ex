defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller
  alias Console.Organizations
  alias Console.Auth

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
              oauth_provider: user_metadata["oauth_provider"]
            },
            ttl: {1, :day}
          )
        do
          all_non_magic_memberships =
            user_metadata["email"]
            |> Organizations.get_all_memberships()
            |> Enum.filter(fn m -> String.slice(m.user_id, 0, 9) != "did:ethr:" end)

          case length(all_non_magic_memberships) do
            0 ->
              conn
              |> put_status(:created)
              |> render("show.json", jwt: token, claims: claims)
            _ ->
              old_user_ids = Enum.map(all_non_magic_memberships, fn m -> m.user_id end)
              {count, nil} = Organizations.update_all_memberships(old_user_ids, user_metadata["issuer"])

              cond do
                count == length(all_non_magic_memberships) ->
                  conn
                  |> put_status(:created)
                  |> render("show.json", jwt: token, claims: claims)
                true ->
                  {:error, :internal_server_error, "Failed to migrate organizations to new login, please try again or contact support."}
              end
          end
        end
      end
    end
  end

  def check_user(conn, %{"email" => email}) do
    did_token =
      conn
      |> get_req_header("authorization")
      |> List.first()
      |> String.replace("Bearer ", "")

    with true <- Magic.Token.validate!(did_token) do
      case Auth.get_user_by_email(email) do
        nil ->
          conn
          |> send_resp(:not_found, "")
        _ ->
          conn
          |> send_resp(:no_content, "")
      end
    end
  end

  def verify_recaptcha(conn, %{"token" => token}) do
    body = URI.encode_query(%{
      "secret" => Application.get_env(:console, :recaptcha_secret_key),
      "response" => token
    })

    response = HTTPoison.post!("https://www.google.com/recaptcha/api/siteverify", body, %{"Content-Type" => "application/x-www-form-urlencoded"})
    conn
    |> send_resp(:ok, response.body)
  end
end
