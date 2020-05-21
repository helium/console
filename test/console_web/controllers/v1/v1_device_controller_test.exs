defmodule ConsoleWeb.V1DeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.Devices

  describe "devices" do
    test "inactive api keys do not work", %{conn: conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end

    test "CRUD actions work properly", %{conn: conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      assert_error_sent 500, fn ->
        build_conn() |> get("/api/v1/devices")
      end # no api key attached

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices")
      assert json_response(resp_conn, 200) == [] # returns no devices when no devices created in org

      assert_error_sent 400, fn ->
        resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/devices", %{ "name" => "device", "dev_eui" => "1", "app_eui" => "2" })
      end # not all device attrs in body

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/devices", %{ "name" => "device", "dev_eui" => "1", "app_eui" => "2", "app_key" => "3" })
      assert response(resp_conn, 422) # attrs must be valid, lengths need to be respected

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/devices", %{ "name" => "device", "dev_eui" => "1111111111111111", "app_eui" => "1111111111111111", "app_key" => "11111111111111111111111111111111" })
      device = json_response(resp_conn, 201) # device created

      organization_2 = insert(:organization)
      device_2 = insert(:device, %{ organization_id: organization_2.id })

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices")
      assert json_response(resp_conn, 200) |> length() == 1
      assert json_response(resp_conn, 200) |> List.first() |> Map.get("id") == device["id"] # index only shows our devices in our org

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("id") == device["id"] # device show gives back our device

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device_2.id}")
      assert json_response(resp_conn, 404) # device show does not give back other org devices

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device_2.id}")
      assert json_response(resp_conn, 404) # device show does not give back other org devices

      assert Devices.get_device(device["id"]) != nil
      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device["id"]}")
      assert response(resp_conn, 200) # device show does not give back other org devices
      assert Devices.get_device(device["id"]) == nil
    end
  end
end
