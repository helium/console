defmodule ConsoleWeb.GatewayControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Gateways
  alias Console.Gateways.Gateway

  import Console.FactoryHelper

  @create_attrs %{latitude: "120.5", longitude: "120.5", mac: "some mac", name: "some name", public_key: "some public_key"}
  @update_attrs %{latitude: "456.7", longitude: "456.7", mac: "some updated mac", name: "some updated name", public_key: "some updated public_key"}
  @invalid_attrs %{latitude: nil, longitude: nil, mac: nil, name: nil, public_key: nil}

  def fixture(:gateway) do
    {:ok, gateway} = Gateways.create_gateway(@create_attrs)
    gateway
  end

  describe "index" do
    setup [:authenticate_user]

    test "lists all gateways", %{conn: conn} do
      conn = get conn, gateway_path(conn, :index)
      assert json_response(conn, 200) == []
    end
  end

  describe "create gateway" do
    setup [:authenticate_user]

    test "renders gateway when data is valid", %{conn: conn} do
      conn = post conn, gateway_path(conn, :create), gateway: @create_attrs
      %{"id" => id} = json_response(conn, 201)
      assert json_response(conn, 201) == %{
        "id" => id,
        "latitude" => "120.5",
        "longitude" => "120.5",
        "mac" => "some mac",
        "name" => "some name"}
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, gateway_path(conn, :create), gateway: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update gateway" do
    setup [:authenticate_user, :create_gateway]

    test "renders gateway when data is valid", %{conn: conn, gateway: %Gateway{id: id} = gateway} do
      conn = put conn, gateway_path(conn, :update, gateway), gateway: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => id,
        "latitude" => "456.7",
        "longitude" => "456.7",
        "mac" => "some updated mac",
        "name" => "some updated name"}
    end

    test "renders errors when data is invalid", %{conn: conn, gateway: gateway} do
      conn = put conn, gateway_path(conn, :update, gateway), gateway: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete gateway" do
    setup [:authenticate_user, :create_gateway]

    test "deletes chosen gateway", %{conn: conn, gateway: gateway} do
      conn = delete conn, gateway_path(conn, :delete, gateway)
      assert response(conn, 204)
    end
  end

  defp create_gateway(_) do
    gateway = fixture(:gateway)
    {:ok, gateway: gateway}
  end
end
