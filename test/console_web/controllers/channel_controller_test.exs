defmodule ConsoleWeb.ChannelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  @create_attrs %{active: true, credentials: %{"a" => "b", "endpoint" => "http://test.com/api"}, name: "some name", type: "http", type_name: "HTTP"}
  @update_attrs %{active: true, credentials: %{"a" => "c", "endpoint" => "http://test.com/api"}, name: "some updated name", type: "mqtt", type_name: "MQTT"}
  @invalid_attrs %{active: nil, credentials: nil, name: nil, type: nil}

  describe "channels" do
    setup [:authenticate_user]

    test "creates channel when data is valid", %{conn: conn} do
      # conn = post conn, channel_path(conn, :create), channel: @create_attrs, labels: []
      # created_channel = json_response(conn, 201)
      # assert created_channel["name"] == @create_attrs.name
      # assert created_channel["active"] == @create_attrs.active
      # assert created_channel["credentials"]["a"] == @create_attrs.credentials["a"]
      # assert created_channel["type"] == @create_attrs.type
    end
  end
end
