defmodule ConsoleWeb.Router.SessionController do
  use ConsoleWeb, :controller

  def create(conn, %{"secret" => given_secret}) do
    valid_secrets = Application.fetch_env!(:console, :router_secrets)

    if Enum.member?(valid_secrets, given_secret) do
      # encode the secret version so that if it changes the token will be invalid
      [secret_version, _] = String.split(given_secret, ":")

      # encode the remote ip address so that this token cannot be used elsewhere
      remote_ip = conn.remote_ip |> Tuple.to_list() |> Enum.join(".")

      {:ok, token, _claims} =
        ConsoleWeb.Guardian.encode_and_sign(
          %{
            id: secret_version,
          },
          %{
            typ: "router",
            ipa: remote_ip
          },
          ttl: {1, :day}
        )

      conn
      |> put_status(:created)
      |> render("show.json", jwt: token)
    else
      conn
      |> put_status(:unauthorized)
      |> render(ConsoleWeb.ErrorView, "error.json", error: "Invalid secret")
    end
  end
end
