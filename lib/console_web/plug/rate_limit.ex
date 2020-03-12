defmodule ConsoleWeb.Plug.RateLimit do
  import Plug.Conn

  def init(default), do: default

  def call(conn, [action, limit]) do
    ip_address = conn.remote_ip |> :inet_parse.ntoa |> to_string()

    case Hammer.check_rate("#{action}:#{ip_address}", 60_000, limit) do
      {:allow, _count} ->
        conn
      {:deny, _limit} ->
        conn
        |> send_resp(:too_many_requests, "Too many requests")
        |> halt()
    end
  end
end
