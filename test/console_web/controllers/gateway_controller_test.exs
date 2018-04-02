defmodule ConsoleWeb.GatewayControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory
  import Console.FactoryHelper

  @create_attrs %{latitude: "120.5", longitude: "120.5", mac: "some mac", name: "some name", public_key: "some public_key"}
  @update_attrs %{latitude: "456.7", longitude: "456.7", mac: "some updated mac", name: "some updated name", public_key: "some updated public_key"}
  @invalid_attrs %{latitude: nil, longitude: nil, mac: nil, name: nil, public_key: nil}

  describe "index" do
    setup [:authenticate_user]

    test "lists all gateways", %{conn: conn, team: team} do
      gateway = create_gateway_for_team(team)
      another_team = insert(:team)
      create_gateway_for_team(another_team)
      conn = get conn, gateway_path(conn, :index)
      ids = for d <- json_response(conn, 200), do: d["id"]
      assert ids == [gateway.id]
    end
  end

  describe "create gateway" do
    setup [:authenticate_user]

    test "renders gateway when data is valid", %{conn: conn, team: team} do
      conn = post conn, gateway_path(conn, :create), gateway: @create_attrs
      %{"id" => id} = json_response(conn, 201)
      assert json_response(conn, 201) == %{
        "id" => id,
        "latitude" => "120.5",
        "longitude" => "120.5",
        "mac" => "some mac",
        "name" => "some name",
        "team_id" => team.id
      }
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, gateway_path(conn, :create), gateway: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update gateway" do
    setup [:authenticate_user]

    test "renders gateway when data is valid", %{conn: conn, team: team} do
      gateway = create_gateway_for_team(team)
      conn = put conn, gateway_path(conn, :update, gateway.id), gateway: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => gateway.id,
        "latitude" => "456.7",
        "longitude" => "456.7",
        "mac" => "some updated mac",
        "name" => "some updated name",
        "team_id" => team.id
      }
    end

    test "renders errors when data is invalid", %{conn: conn, team: team} do
      gateway = create_gateway_for_team(team)
      conn = put conn, gateway_path(conn, :update, gateway), gateway: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete gateway" do
    setup [:authenticate_user]

    test "deletes chosen gateway", %{conn: conn, team: team} do
      gateway = create_gateway_for_team(team)
      conn = delete conn, gateway_path(conn, :delete, gateway)
      assert response(conn, 204)
    end
  end
end
