defmodule ConsoleWeb.Plug.RateLimit do
  import Plug.Conn

  def init(default), do: default

  def call(conn, [action, limit]) do
    ip_address = conn |> get_req_header("cf-connecting-ip") |> List.first()

    if Mix.env == :test do
      conn
    else
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
end
