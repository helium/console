defmodule ConsoleWeb.Plug.VerifyRouterIpAddress do
  import Plug.Conn, only: [halt: 1]
  import ConsoleWeb.AuthErrorHandler

  def init(default), do: default

  def call(conn, _default) do
    remote_ip = conn.remote_ip |> Tuple.to_list() |> Enum.join(".")
    %{"ipa" => token_ip} = ConsoleWeb.Guardian.Plug.current_claims(conn)

    if remote_ip == token_ip do
      conn
    else
      conn
      |> auth_error({:invalid_ip_address, :invalid_ip_address}, %{})
      |> halt()
    end
  end
end
