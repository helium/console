defmodule ConsoleWeb.ChannelControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Channels
  alias Console.Channels.Channel

  import ConsoleWeb.Guardian
  import Console.Factory

  @create_attrs %{active: true, credentials: %{"a" => "b"}, name: "some name", type: "some type"}
  @update_attrs %{active: false, credentials: %{"a" => "c"}, name: "some updated name", type: "some updated type"}
  @invalid_attrs %{active: nil, credentials: nil, name: nil, type: nil}

  describe "index" do
    setup [:authenticate_user]

    test "lists all channels", %{conn: conn} do
      conn = get conn, channel_path(conn, :index)
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create channel" do
    setup [:authenticate_user]

    test "renders channel when data is valid", %{conn: conn} do
      conn = post conn, channel_path(conn, :create), channel: @create_attrs
      %{"id" => id} = json_response(conn, 201)["data"]
      assert json_response(conn, 201)["data"] == %{
        "id" => id,
        "active" => true,
        "credentials" => %{"a" => "b"},
        "name" => "some name",
        "type" => "some type"}
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, channel_path(conn, :create), channel: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update channel" do
    setup [:authenticate_user, :create_channel]

    test "renders channel when data is valid", %{conn: conn, channel: %Channel{id: id} = channel} do
      conn = put conn, channel_path(conn, :update, channel), channel: @update_attrs
      assert json_response(conn, 200)["data"] == %{
        "id" => id,
        "active" => false,
        "credentials" => %{"a" => "c"},
        "name" => "some updated name",
        "type" => "some updated type"}
    end

    test "renders errors when data is invalid", %{conn: conn, channel: channel} do
      conn = put conn, channel_path(conn, :update, channel), channel: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete channel" do
    setup [:authenticate_user, :create_channel]

    test "deletes chosen channel", %{conn: conn, channel: channel} do
      conn = delete conn, channel_path(conn, :delete, channel)
      assert response(conn, 204)
    end
  end

  defp authenticate_user(%{conn: conn}) do
    user = insert(:user)
    {:ok, token, _} = encode_and_sign(user, %{}, token_type: :access)
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", "bearer: " <> token)
    {:ok, conn: conn}
  end

  defp create_channel(_) do
    channel = insert(:channel)
    {:ok, channel: channel}
  end
end
