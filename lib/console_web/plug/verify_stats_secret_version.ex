defmodule ConsoleWeb.Plug.VerifyStatsSecretVersion do
  import Plug.Conn, only: [halt: 1, get_req_header: 2]
  import ConsoleWeb.AuthErrorHandler

  def init(default), do: default

  def call(conn, _default) do
    valid_versions = [Application.fetch_env!(:console, :stats_secrets)]
    secret_version = conn |> get_req_header("authorization") |> List.first()

    if Enum.member?(valid_versions, secret_version) do
      conn
    else
      conn
      |> auth_error({:invalid_secret_version, :invalid_secret_version}, %{})
      |> halt()
    end
  end
end
