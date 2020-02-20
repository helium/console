defmodule ConsoleWeb.ChannelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  @create_attrs %{active: true, credentials: %{"a" => "b", "endpoint" => "http://test.com/api"}, name: "some name", type: "http", type_name: "HTTP"}
  @update_attrs %{active: false, credentials: %{"a" => "c", "endpoint" => "http://test.com/api"}, name: "some updated name", type: "mqtt", type_name: "MQTT"}
  @invalid_attrs %{active: nil, credentials: nil, name: nil, type: nil}

  describe "channels" do
    setup [:authenticate_user]

    test "lists all channels", %{conn: conn, organization: organization} do
      create_channel_for_organization(organization)
      create_channel_for_organization(organization)
      another_organization = insert(:organization)
      channel = create_channel_for_organization(another_organization)
      conn = get conn, channel_path(conn, :index)
      ids = for d <- json_response(conn, 200), do: d["id"]
      assert not Enum.member?(ids, channel.id)
    end

    test "creates channel when data is valid", %{conn: conn} do
      conn = post conn, channel_path(conn, :create), channel: @create_attrs, labels: []
      created_channel = json_response(conn, 201)
      assert created_channel["name"] == @create_attrs.name
      assert created_channel["active"] == @create_attrs.active
      assert created_channel["credentials"]["a"] == @create_attrs.credentials["a"]
      assert created_channel["type"] == @create_attrs.type
    end

    test "renders create errors when data is invalid", %{conn: conn} do
      conn = post conn, channel_path(conn, :create), channel: @invalid_attrs, labels: []
      assert json_response(conn, 422)["errors"] != %{}
    end

    test "updates channel when data is valid", %{conn: conn, organization: organization} do
      channel = create_channel_for_organization(organization)
      conn = put conn, channel_path(conn, :update, channel), channel: @update_attrs
      updated_channel = json_response(conn, 200)
      assert updated_channel["name"] == @update_attrs.name
      assert updated_channel["active"] == @update_attrs.active
      assert updated_channel["credentials"]["a"] == @update_attrs.credentials["a"]
      assert updated_channel["type"] == @update_attrs.type
    end

    test "renders update errors when data is invalid", %{conn: conn, organization: organization} do
      channel = create_channel_for_organization(organization)
      conn = put conn, channel_path(conn, :update, channel), channel: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end

    test "deletes chosen channel", %{conn: conn, organization: organization} do
      channel = create_channel_for_organization(organization)
      conn = delete conn, channel_path(conn, :delete, channel)
      assert response(conn, 200)
    end
  end
end
