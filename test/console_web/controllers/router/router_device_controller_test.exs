defmodule ConsoleWeb.RouterDeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "devices" do
    test "router can get devices by dev and app eui", %{conn: conn} do
      resp_conn = build_conn() |> post("/api/router/sessions", %{
        "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
      })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id })

      resp_conn = build_conn() |> get("/api/router/devices/yolo?app_eui=#{device_0.app_eui}&dev_eui=#{device_0.dev_eui}")
      assert response(resp_conn, 401) # unauthenticated

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> get("/api/router/devices/yolo?app_eui=#{device_0.app_eui}&dev_eui=#{device_0.dev_eui}")
      devices_json = json_response(resp_conn, 200)
      assert devices_json |> length() == 1
      assert devices_json |> List.first() |> Map.get("id") == device_0.id
      assert devices_json |> List.first() |> Map.get("channels") == [] # get a device back with no channels

      device_1 = insert(:device, %{ organization_id: organization.id })
      label_1 = insert(:label, %{ organization_id: organization.id })
      label_2 = insert(:label, %{ organization_id: organization.id })
      channel_1 = insert(:channel, %{ organization_id: organization.id })
      insert(:devices_labels, %{ device_id: device_1.id, label_id: label_1.id })
      insert(:devices_labels, %{ device_id: device_1.id, label_id: label_2.id })
      insert(:channels_labels, %{ channel_id: channel_1.id, label_id: label_1.id })
      insert(:channels_labels, %{ channel_id: channel_1.id, label_id: label_2.id })

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> get("/api/router/devices/yolo?app_eui=#{device_1.app_eui}&dev_eui=#{device_1.dev_eui}")
      devices_json = json_response(resp_conn, 200)
      assert devices_json |> List.first() |> Map.get("channels") |> length() == 1

      device_2 = insert(:device, %{ organization_id: organization.id })
      channel_2 = insert(:channel, %{ organization_id: organization.id })
      channel_3 = insert(:channel, %{ organization_id: organization.id })
      label_3 = insert(:label, %{ organization_id: organization.id })
      insert(:devices_labels, %{ device_id: device_2.id, label_id: label_3.id })
      insert(:channels_labels, %{ channel_id: channel_2.id, label_id: label_3.id })
      insert(:channels_labels, %{ channel_id: channel_3.id, label_id: label_3.id })

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> get("/api/router/devices/yolo?app_eui=#{device_2.app_eui}&dev_eui=#{device_2.dev_eui}")
      devices_json = json_response(resp_conn, 200)
      assert devices_json |> List.first() |> Map.get("channels") |> length() == 2
    end

    test "router can get single device by id", %{conn: conn} do
      resp_conn = build_conn()
        |> post("/api/router/sessions", %{
          "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
        })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id })

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> get("/api/router/devices/#{device_0.id}")
      assert json_response(resp_conn, 200)
    end

    test "router add event to device event log", %{conn: conn} do
      resp_conn = build_conn()
        |> post("/api/router/sessions", %{
          "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
        })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id })
      channel_0 = insert(:channel, %{ organization_id: organization.id })
      timestamp = NaiveDateTime.utc_now() |> NaiveDateTime.diff(~N[1970-01-01 00:00:00])

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> post("/api/router/devices/#{device_0.id}/event", %{
          "id" => "UUID-V4",
          "category" => "uplink",
          "sub_category" => "ack",
          "description" => "test description",
          "reported_at" => timestamp,
          "device_id" => "device_uuid",
          "data" => %{
            "fcnt" => 2,
            "payload_size" => 12,
            "payload" => "base64 payload",
            "port" => 1,
            "devaddr" => "devaddr",
            "hotspot" => %{
              "id" => "hotspot_id",
              "name" => "hotspot name",
              "rssi" => -30,
              "snr" => 0.2,
              "spreading" => "SF9BW125",
              "frequency" => 923.3,
              "channel" => 12,
              "lat" => 37.00001962582851,
              "long" => -120.9000053210367
            },
            "dc" => %{
              "balance" => 3000,
              "nonce" => 0,
              "used" => 1
            },
          }
        })

      assert response(resp_conn, 200)
    end
  end
end
