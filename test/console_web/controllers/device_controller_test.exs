defmodule ConsoleWeb.DeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  alias Console.Devices

  describe "channels" do
    setup [:authenticate_user]

    test "creates devices properly", %{conn: conn} do
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaaa", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])
      assert device.oui != nil
      assert device.organization_id == conn |> get_req_header("organization") |> List.first()

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "a", "app_eui" => "b", "app_key" => "c" },
        "label_id" => nil
      }
      assert json_response(resp_conn, 422) # attrs must be correct length

      assert_error_sent 400, fn ->
        resp_conn = post conn, device_path(conn, :create), %{
          "device" => %{ "name" => "n", "dev_eui" => "a", "app_eui" => "b", "app_key" => "c" }
        }
      end # payload must contain label_id key

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      assert json_response(resp_conn, 201)
    end

    test "create devices with label linked properly", %{conn: conn} do
      # device is still created even if label does not parse by design
      assert_error_sent 400, fn ->
        resp_conn = post conn, device_path(conn, :create), %{
          "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
          "label_id" => %{}
        }
      end # label attr invalid type

      assert_error_sent 400, fn ->
        resp_conn = post conn, device_path(conn, :create), %{
          "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa2", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
          "label_id" => ""
        }
      end # label attr invalid type

      organization_id = conn |> get_req_header("organization") |> List.first()
      label_1 = insert(:label, %{ organization_id: organization_id })
      label_2 = insert(:label) # not inserted into same organization

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa3", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => label_1.id
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])
      device = device |> Devices.fetch_assoc([:labels])

      assert Enum.find(device.labels, fn l -> l.id == label_1.id end)
      assert Enum.find(device.labels, fn l -> l.id == label_2.id end) == nil
    end

    test "updates devices properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id })
      assert_error_sent 404, fn ->
        resp_conn = put conn, device_path(conn, :update, not_my_device.id), %{ "device" => %{ "name" => "device not mine" }}
      end # does not update device not in own org

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa3", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])

      resp_conn = put conn, device_path(conn, :update, device.id), %{ "device" => %{ "name" => "device new" }}
      device = json_response(resp_conn, 200)
      assert device["name"] == "device new" # updating name

      resp_conn = put conn, device_path(conn, :update, device["id"]), %{ "device" => %{ "dev_eui" => "gasdf" }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"message" => ["Dev EUI must be exactly 8 bytes long, and only contain characters 0-9 A-F"]}}

      assert device["organization_id"] == conn |> get_req_header("organization") |> List.first()
      resp_conn = put conn, device_path(conn, :update, device["id"]), %{ "device" => %{ "organization_id" => not_my_org.id }}
      device = json_response(resp_conn, 200)
      assert device["organization_id"] == conn |> get_req_header("organization") |> List.first()
    end

    test "delete devices properly with single id route", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id })
      assert_error_sent 404, fn ->
        resp_conn = delete conn, device_path(conn, :delete, not_my_device.id)
      end # does not delete device not in own org

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa3", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      device = json_response(resp_conn, 201)

      assert Devices.get_device(device["id"]) != nil

      resp_conn = delete conn, device_path(conn, :delete, device["id"])
      assert response(resp_conn, 204)

      assert Devices.get_device(device["id"]) == nil
    end

    test "delete multiple devices properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id })

      resp_conn = post conn, device_path(conn, :delete), %{ "devices" => [not_my_device.id], "label_id" => "none" }
      assert response(resp_conn, 204)
      assert Devices.get_device(not_my_device.id) != nil

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      device_1 = json_response(resp_conn, 201)
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "m", "dev_eui" => "aaaaaaaaaaaaaaa2", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      device_2 = json_response(resp_conn, 201)
      assert Devices.get_device(device_1["id"]) != nil
      assert Devices.get_device(device_2["id"]) != nil

      resp_conn = post conn, device_path(conn, :delete), %{ "devices" => [device_1["id"], device_2["id"]] }
      assert response(resp_conn, 200)

      assert Devices.get_device(device_1["id"]) == nil
      assert Devices.get_device(device_2["id"]) == nil
    end

    test "debug device works properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id })

      assert_error_sent 404, fn ->
        resp_conn = post conn, device_path(conn, :debug), %{ "device" => not_my_device.id}
      end

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label_id" => nil
      }
      device = json_response(resp_conn, 201)
      resp_conn = post conn, device_path(conn, :debug), %{ "device" => device["id"]}
      assert response(resp_conn, 204)
    end
  end
end
