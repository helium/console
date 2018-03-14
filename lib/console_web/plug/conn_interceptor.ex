defmodule ConsoleWeb.Plug.ConnInterceptor do
  import Plug.Conn, only: [assign: 3]

  def init(default), do: default

  def call(conn, _default) do
    IO.inspect conn
    conn
  end
end
