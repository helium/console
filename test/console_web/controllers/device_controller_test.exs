defmodule ConsoleWeb.DeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  @create_attrs %{app_eui: "some app_eui", name: "some name", app_key: "some app_key", dev_eui: "randomeui"}
  @update_attrs %{app_eui: "some updated app_eui", name: "some updated name", app_key: "some updated app_key"}
  @invalid_attrs %{app_eui: nil, name: nil, public_key: nil}

  describe "index" do
    setup [:authenticate_user]

    test "lists all devices for a organization", %{conn: conn, organization: organization} do
      create_device_for_organization(organization)
      create_device_for_organization(organization)
      another_organization = insert(:organization)
      another_device = create_device_for_organization(another_organization)
      conn = get conn, device_path(conn, :index)
      ids = for d <- json_response(conn, 200), do: d["id"]
      assert not Enum.member?(ids, another_device.id)
    end

    test "creates device when data is valid", %{conn: conn, organization: organization} do
      conn = post conn, device_path(conn, :create), device: @create_attrs
      %{"id" => id} = json_response(conn, 201)
      assert json_response(conn, 201) == %{
        "id" => id,
        "name" => "some name",
        "organization_id" => organization.id,
      }
    end

    test "renders create errors when data is invalid", %{conn: conn} do
      conn = post conn, device_path(conn, :create), device: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end

    test "renders show device", %{conn: conn, organization: organization} do
      device = create_device_for_organization(organization)
      conn = get conn, device_path(conn, :show, device.id)
      assert json_response(conn, 200) == %{
        "id" => device.id,
        "name" => device.name,
        "organization_id" => organization.id,
      }
    end

    test "renders update device when data is valid", %{conn: conn, organization: organization} do
      device = create_device_for_organization(organization)
      conn = put conn, device_path(conn, :update, device.id), device: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => device.id,
        "name" => "some updated name",
        "organization_id" => organization.id,
      }
    end

    test "renders update errors when data is invalid", %{conn: conn, organization: organization} do
      device = create_device_for_organization(organization)
      conn = put conn, device_path(conn, :update, device.id), device: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end

    test "deletes chosen device", %{conn: conn, organization: organization} do
      device = create_device_for_organization(organization)
      conn = delete conn, device_path(conn, :delete, device.id)
      assert response(conn, 204)
    end
  end
end
