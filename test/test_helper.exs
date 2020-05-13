import Mox
defmodule Console.AccessTokenDecoder.MockDecodeAccessToken do
  @behaviour ConsoleWeb.AccessTokenDecoder
  def decode_conn_access_token(token) do
    user_id_and_email = token |> String.split(" ")
    %{user_id: List.first(user_id_and_email), email: List.last(user_id_and_email), auth0_id: "example"}
  end
end
defmock(Console.DecodeAccessMock, for: ConsoleWeb.AccessTokenDecoder)
stub_with(Console.DecodeAccessMock, Console.AccessTokenDecoder.MockDecodeAccessToken)

ExUnit.start()

Ecto.Adapters.SQL.Sandbox.mode(Console.Repo, :manual)
