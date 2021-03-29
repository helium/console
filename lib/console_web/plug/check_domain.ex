defmodule ConsoleWeb.Plug.CheckDomain do
  def init(default), do: default

  def call(conn, _default) do
    header_cl = Plug.Conn.get_req_header(conn, "content-length")
    header_te = Plug.Conn.get_req_header(conn, "transfer-encoding")

    cl_te_error = List.first(header_cl) != nil and List.first(header_te) != nil
    cl_cl_error = length(header_cl) > 1
    te_te_error = length(header_te) > 1

    if cl_te_error or cl_cl_error or te_te_error do
      conn
      |> Plug.Conn.halt()
    else
      case conn.host do
        "helium-console-dev.herokuapp.com" -> conn
        "helium-console-flows.herokuapp.com" -> conn
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
end
