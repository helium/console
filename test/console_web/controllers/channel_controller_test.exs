defmodule ConsoleWeb.ChannelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  @create_attrs %{active: true, credentials: %{"a" => "b"}, name: "some name", type: "some type"}
  @update_attrs %{active: false, credentials: %{"a" => "c"}, name: "some updated name", type: "some updated type"}
  @invalid_attrs %{active: nil, credentials: nil, name: nil, type: nil}

  describe "index" do
    setup [:authenticate_user]

    test "lists all channels", %{conn: conn, team: team} do
      channel = create_channel_for_team(team)
      another_team = insert(:team)
      create_channel_for_team(another_team)
      conn = get conn, channel_path(conn, :index)
      ids = for d <- json_response(conn, 200), do: d["id"]
      assert ids == [channel.id]
    end
  end

  describe "create channel" do
    setup [:authenticate_user]

    test "renders channel when data is valid", %{conn: conn, team: team} do
      conn = post conn, channel_path(conn, :create), channel: @create_attrs
      %{"id" => id} = json_response(conn, 201)
      assert json_response(conn, 201) == %{
        "id" => id,
        "active" => true,
        "credentials" => %{"a" => "b"},
        "name" => "some name",
        "type" => "some type",
        "team_id" => team.id
      }
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, channel_path(conn, :create), channel: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update channel" do
    setup [:authenticate_user]

    test "renders channel when data is valid", %{conn: conn, team: team} do
      channel = create_channel_for_team(team)
      conn = put conn, channel_path(conn, :update, channel), channel: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => channel.id,
        "active" => false,
        "credentials" => %{"a" => "c"},
        "name" => "some updated name",
        "type" => "some updated type",
        "team_id" => team.id,
        "groups" => []
      }
    end

    test "renders errors when data is invalid", %{conn: conn, team: team} do
      channel = create_channel_for_team(team)
      conn = put conn, channel_path(conn, :update, channel), channel: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete channel" do
    setup [:authenticate_user]

    test "deletes chosen channel", %{conn: conn, team: team} do
      channel = create_channel_for_team(team)
      conn = delete conn, channel_path(conn, :delete, channel)
      assert response(conn, 204)
    end
  end
end
