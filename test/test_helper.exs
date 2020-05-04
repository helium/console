import Mox
import Plug.Conn, only: [assign: 3, get_req_header: 2]
defmodule Console.AccessTokenDecoder.MockDecodeAccessToken do
  @behaviour ConsoleWeb.AccessTokenDecoder
  def decode_conn_access_token(conn) do
    user_id_and_email = conn |> get_req_header("authorization") |> List.first() |> String.split(" ")
    %{user_id: List.first(user_id_and_email), email: List.last(user_id_and_email)}
  end
end
defmock(Console.DecodeAccessMock, for: ConsoleWeb.AccessTokenDecoder)
stub_with(Console.DecodeAccessMock, Console.AccessTokenDecoder.MockDecodeAccessToken)

ExUnit.start()

Ecto.Adapters.SQL.Sandbox.mode(Console.Repo, :manual)
