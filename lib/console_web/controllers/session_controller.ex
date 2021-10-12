defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller
  import ConsoleWeb.AuthErrorHandler
  alias Console.Organizations

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
end
