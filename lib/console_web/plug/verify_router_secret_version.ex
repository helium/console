defmodule ConsoleWeb.Plug.VerifyRouterSecretVersion do
  import Plug.Conn, only: [halt: 1]
  import ConsoleWeb.AuthErrorHandler

  def init(default), do: default

  def call(conn, _default) do
    valid_secrets = Application.fetch_env!(:console, :router_secrets)
    valid_versions = for s <- valid_secrets, do: List.first(String.split(s, ":"))
    %{"sub" => secret_version} = ConsoleWeb.Guardian.Plug.current_claims(conn)

    if Enum.member?(valid_versions, secret_version) do
      conn
    else
      conn
      |> auth_error({:invalid_secret_version, :invalid_secret_version}, %{})
      |> halt()
    end
  end
end
