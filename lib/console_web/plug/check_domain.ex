defmodule ConsoleWeb.Plug.CheckDomain do
  import Plug.Conn

  def init(default), do: default

  def call(conn, _default) do
    case conn.host do
      "staging-console.helium.com" -> conn
      "console.helium.com" -> conn
      "www.example.com" -> conn
      "localhost" -> conn
      _ ->
        if Application.get_env(:console, :self_hosted) == nil do
          conn
          |> Plug.Conn.resp(:found, "")
          |> Plug.Conn.put_resp_header("location", "https://console.helium.com")
        else
          conn
        end
    end
  end
end
