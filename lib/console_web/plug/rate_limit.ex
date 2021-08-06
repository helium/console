defmodule ConsoleWeb.Plug.RateLimit do
  import Plug.Conn

  def init(default), do: default

  def call(conn, [action, limit]) do
    cf_ip = conn |> get_req_header("cf-connecting-ip") |> List.first()
    regular_ip = conn |> get_req_header("x-forwarded-for") |> List.first()

    ip_address =
      case cf_ip do
        nil -> regular_ip
        _ -> cf_ip
      end

    if Application.get_env(:console, :env) == :test or Application.get_env(:console, :env) == :dev do
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
