defmodule ConsoleWeb.DeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  @create_attrs %{mac: "some mac", name: "some name", public_key: "some public_key"}
  @update_attrs %{mac: "some updated mac", name: "some updated name", public_key: "some updated public_key"}
  @invalid_attrs %{mac: nil, name: nil, public_key: nil}

  describe "index" do
    setup [:authenticate_user]

    test "lists all devices for a team", %{conn: conn, team: team} do
      device = create_device_for_team(team)
      another_team = insert(:team)
      create_device_for_team(another_team)
      conn = get conn, device_path(conn, :index)
      ids = for d <- json_response(conn, 200), do: d["id"]
      assert ids == [device.id]
    end
  end

  describe "create device" do
    setup [:authenticate_user]

    test "renders device when data is valid", %{conn: conn, team: team} do
      conn = post conn, device_path(conn, :create), device: @create_attrs
      %{"id" => id} = json_response(conn, 201)
      assert json_response(conn, 201) == %{
        "id" => id,
        "mac" => "some mac",
        "name" => "some name",
        "team_id" => team.id,
        "groups" => []
      }
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, device_path(conn, :create), device: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "show device" do
    setup [:authenticate_user]

    test "renders device", %{conn: conn, team: team} do
      device = create_device_for_team(team)
      conn = get conn, device_path(conn, :show, device.id)
      assert json_response(conn, 200) == %{
        "id" => device.id,
        "mac" => device.mac,
        "name" => device.name,
        "team_id" => team.id,
        "events" => [],
        "groups" => []
      }
    end
  end

  describe "update device" do
    setup [:authenticate_user]

    test "renders device when data is valid", %{conn: conn, team: team} do
      device = create_device_for_team(team)
      conn = put conn, device_path(conn, :update, device.id), device: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => device.id,
        "mac" => "some updated mac",
        "name" => "some updated name",
        "team_id" => team.id,
        "groups" => []
      }
    end

    test "renders errors when data is invalid", %{conn: conn, team: team} do
      device = create_device_for_team(team)
      conn = put conn, device_path(conn, :update, device.id), device: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete device" do
    setup [:authenticate_user]

    test "deletes chosen device", %{conn: conn, team: team} do
      device = create_device_for_team(team)
      conn = delete conn, device_path(conn, :delete, device.id)
      assert response(conn, 204)
    end
  end
end
