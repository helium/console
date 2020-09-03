defmodule ConsoleWeb.Plug.VerifyRemoteIpRange do
  import Plug.Conn, only: [send_resp: 3, halt: 1]

  def init(default), do: default

  def call(conn, _default) do
    if System.get_env("BLOCK_NON_PROXY") do
      case conn |> ip_to_string() |> in_allowed_ips() do
        true -> conn
        _ -> conn |> send_resp(:forbidden, "Forbidden request") |> halt()
      end
    else
      conn
    end
  end

  defp ip_to_string(conn) do
    conn.remote_ip |> Tuple.to_list() |> Enum.join(".")
  end

  defp in_allowed_ips(ip) do
    Application.get_env(:console, :allowed_ip_range) |> Enum.member?(ip)
  end

end
