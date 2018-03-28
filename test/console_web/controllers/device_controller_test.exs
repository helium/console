defmodule ConsoleWeb.DeviceControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Devices
  alias Console.Devices.Device

  import Console.FactoryHelper

  @create_attrs %{mac: "some mac", name: "some name", public_key: "some public_key"}
  @update_attrs %{mac: "some updated mac", name: "some updated name", public_key: "some updated public_key"}
  @invalid_attrs %{mac: nil, name: nil, public_key: nil}

  def fixture(:device) do
    {:ok, device} = Devices.create_device(@create_attrs)
    device
  end

  describe "index" do
    setup [:authenticate_user]

    test "lists all devices", %{conn: conn} do
      conn = get conn, device_path(conn, :index)
      assert json_response(conn, 200) == []
    end
  end

  describe "create device" do
    setup [:authenticate_user]

    test "renders device when data is valid", %{conn: conn} do
      conn = post conn, device_path(conn, :create), device: @create_attrs
      %{"id" => id} = json_response(conn, 201)
      assert json_response(conn, 201) == %{
        "id" => id,
        "mac" => "some mac",
        "name" => "some name" }
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, device_path(conn, :create), device: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "show device" do
    setup [:authenticate_user, :create_device]

    test "renders device", %{conn: conn, device: %Device{id: id}} do
      conn = get conn, device_path(conn, :show, id)
      assert json_response(conn, 200) == %{
        "id" => id,
        "mac" => "some mac",
        "name" => "some name",
        "events" => []}
    end
  end

  describe "update device" do
    setup [:authenticate_user, :create_device]

    test "renders device when data is valid", %{conn: conn, device: %Device{id: id} = device} do
      conn = put conn, device_path(conn, :update, device), device: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => id,
        "mac" => "some updated mac",
        "name" => "some updated name"}
    end

    test "renders errors when data is invalid", %{conn: conn, device: device} do
      conn = put conn, device_path(conn, :update, device), device: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete device" do
    setup [:authenticate_user, :create_device]

    test "deletes chosen device", %{conn: conn, device: device} do
      conn = delete conn, device_path(conn, :delete, device)
      assert response(conn, 204)
    end
  end

  defp create_device(_) do
    device = fixture(:device)
    {:ok, device: device}
  end
end
