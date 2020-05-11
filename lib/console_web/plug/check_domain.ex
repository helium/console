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
        conn
        |> Plug.Conn.resp(:found, "")
        |> Plug.Conn.put_resp_header("location", "https://console.helium.com")
    end
  end
end
