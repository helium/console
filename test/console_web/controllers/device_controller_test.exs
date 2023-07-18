defmodule ConsoleWeb.DeviceControllerTest do
  use ConsoleWeb.ConnCase
  import Console.Factory

  alias Console.Devices

  describe "channels" do
    setup [:authenticate_user]

    test "creates devices properly", %{conn: conn} do
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaaa", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])
      assert device.oui != nil
      assert device.organization_id == conn |> get_req_header("organization") |> List.first()

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "a", "app_eui" => "b", "app_key" => "c" },
        "label" => nil
      }
      assert json_response(resp_conn, 422) # attrs must be correct length

      assert_error_sent 400, fn ->
        post conn, device_path(conn, :create), %{
          "device" => %{ "name" => "n", "dev_eui" => "a", "app_eui" => "b", "app_key" => "c" }
        }
      end # payload must contain label_id key

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      assert json_response(resp_conn, 201)

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "discovery", "dev_eui" => "aaaaaaaaaaaaaaa2", "app_eui" => "aaaaaaaaaaaaaaa3", "app_key" => "cccccccccccccccccccccccccccccccc", "hotspot_address" => "some_address" },
        "label" => nil
      }
      device2 = json_response(resp_conn, 201)
      device2 = Devices.get_device!(device2["id"])
      assert device2.hotspot_address == nil # device not created through discover endpoint should not have hotspot_address
    end

    test "creates device with max length of 52 in name properly", %{conn: conn} do
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "1234567890123456789012345678901234567890123456789012", "dev_eui" => "aaaaaaaaaaaaaaaa", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])
      assert device.oui != nil
      assert device.organization_id == conn |> get_req_header("organization") |> List.first()

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "12345678901234567890123456789012345678901234567890123", "dev_eui" => "aaaaaaaaaaaaaaab", "app_eui" => "bbbbbbbbbbbbbbbc", "app_key" => "cccccccccccccccccccccccccccccccd" },
        "label" => nil
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{"name" => ["Name cannot be longer than 52 characters"]}}
    end

    test "does not create device with dev_eui 0000000000000000", %{conn: conn} do
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "testing_bad_eui", "dev_eui" => "0000000000000000", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{"message" => ["Dev EUI must be exactly 8 bytes long, and only contain characters 0-9 A-F"]}}
    end

    test "create devices with label linked properly", %{conn: conn} do
      # device is still created even if label does not parse by design
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => %{}
      }
      assert json_response(resp_conn, 201)

      organization_id = conn |> get_req_header("organization") |> List.first()
      label_1 = insert(:label, %{ organization_id: organization_id })
      label_2 = insert(:label) # not inserted into same organization

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa3", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => %{ "labelApplied" => label_1.id }
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])
      device = device |> Devices.fetch_assoc([:labels])

      assert Enum.find(device.labels, fn l -> l.id == label_1.id end)
      assert Enum.find(device.labels, fn l -> l.id == label_2.id end) == nil

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "b", "dev_eui" => "aaaaaaaaaaaaaaa4", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => %{ "newLabel" => "newLabelName" }
      }
      device = json_response(resp_conn, 201)
      device = Devices.get_device!(device["id"])
      device = device |> Devices.fetch_assoc([:labels])

      assert Enum.find(device.labels, fn l -> l.name == "newLabelName" end)
    end

    test "updates devices properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id, dev_eui: "2222222222222222", app_eui: "2222222222222222", app_key: "22222222222222222222222222222222" })
      assert_error_sent 404, fn ->
        put conn, device_path(conn, :update, not_my_device.id), %{ "device" => %{ "name" => "device not mine" }}
      end # does not update device not in own org

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa3", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
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

    test "does not update device with dev_eui 0000000000000000", %{conn: conn} do
      resp_conn = post conn, device_path(conn, :update), %{ "device" => %{ "app_eui" => "0000000000000000" }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"message" => ["Dev EUI must be exactly 8 bytes long, and only contain characters 0-9 A-F"]}}
    end

    test "delete devices properly with single id route", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id, dev_eui: "2222222222222222", app_eui: "2222222222222222", app_key: "22222222222222222222222222222222" })
      assert_error_sent 404, fn ->
        delete conn, device_path(conn, :delete, not_my_device.id)
      end # does not delete device not in own org

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa3", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      device = json_response(resp_conn, 201)

      assert Devices.get_device(device["id"]) != nil

      resp_conn = delete conn, device_path(conn, :delete, device["id"])
      assert response(resp_conn, 204)

      assert Devices.get_device(device["id"]) == nil
    end

    test "delete multiple devices properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id, dev_eui: "2222222222222222", app_eui: "2222222222222222", app_key: "22222222222222222222222222222222" })

      resp_conn = post conn, device_path(conn, :delete), %{ "devices" => [not_my_device.id], "label_id" => "none" }
      assert response(resp_conn, 204)
      assert Devices.get_device(not_my_device.id) != nil

      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "n", "dev_eui" => "aaaaaaaaaaaaaaa1", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      device_1 = json_response(resp_conn, 201)
      resp_conn = post conn, device_path(conn, :create), %{
        "device" => %{ "name" => "m", "dev_eui" => "aaaaaaaaaaaaaaa2", "app_eui" => "bbbbbbbbbbbbbbbb", "app_key" => "cccccccccccccccccccccccccccccccc" },
        "label" => nil
      }
      device_2 = json_response(resp_conn, 201)
      assert Devices.get_device(device_1["id"]) != nil
      assert Devices.get_device(device_2["id"]) != nil

      resp_conn = post conn, device_path(conn, :delete), %{ "devices" => [device_1["id"], device_2["id"]] }
      assert response(resp_conn, 200)

      assert Devices.get_device(device_1["id"]) == nil
      assert Devices.get_device(device_2["id"]) == nil
    end
  end
end
