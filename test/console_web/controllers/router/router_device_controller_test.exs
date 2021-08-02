defmodule ConsoleWeb.RouterDeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "devices" do
    test "router can get devices by dev and app eui", %{conn: _conn} do
      resp_conn = build_conn() |> post("/api/router/sessions", %{
        "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
      })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })

      resp_conn = build_conn() |> get("/api/router/devices/yolo?app_eui=#{device_0.app_eui}&dev_eui=#{device_0.dev_eui}")
      assert response(resp_conn, 401) # unauthenticated

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> get("/api/router/devices/yolo?app_eui=#{device_0.app_eui}&dev_eui=#{device_0.dev_eui}")
      devices_json = json_response(resp_conn, 200)
      assert devices_json |> length() == 1
      assert devices_json |> List.first() |> Map.get("id") == device_0.id
    end

    test "router can get single device by id", %{conn: _conn} do
      resp_conn = build_conn()
        |> post("/api/router/sessions", %{
          "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
        })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> get("/api/router/devices/#{device_0.id}")
      assert json_response(resp_conn, 200)
    end

    test "router add event to device event log", %{conn: _conn} do
      resp_conn = build_conn()
        |> post("/api/router/sessions", %{
          "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
        })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })
      insert(:channel, %{ organization_id: organization.id })
      timestamp = NaiveDateTime.utc_now() |> NaiveDateTime.diff(~N[1970-01-01 00:00:00], :millisecond)

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

      timestamp = NaiveDateTime.utc_now() |> NaiveDateTime.diff(~N[1970-01-01 00:00:00], :millisecond)
      channel = insert(:channel, %{ organization_id: organization.id })

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> post("/api/router/devices/#{device_0.id}/event", %{
          "category" => "uplink",
          "data" => %{
            "integration" => %{
              "id" => channel.id,
              "name" => "AMmq",
              "status" => "success"
            },
            "req" => %{
              "body" => "{\"app_eui\":\"5D536782D4955E8C\",\"decoded\":{\"payload\":{\"Leroy\":\"66\",\"mySensorData\":{\"Sn\":0,\"ack\":0,\"cmd\":0,\"msgType\":0,\"msgVer\":0,\"nodeId\":0,\"payload\":\"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000Ú\",\"port\":2,\"sensorId\":0,\"sensorType\":0}},\"status\":\"success\"},\"dev_eui\":\"C1C701ECD846A299\",\"devaddr\":\"2A000048\",\"fcnt\":1,\"hotspots\":[{\"channel\":10,\"frequency\":904.2999877929688,\"hold_time\":792,\"id\":\"112DnKkS5qVvRoK1TFcbhT7ReezwtNTVmE2zTB2ZnAa3UMZYJ8kN\",\"lat\":32.9550615760182,\"long\":-96.75233778326856,\"name\":\"harsh-sepia-gerbil\",\"reported_at\":1624734033986,\"rssi\":-46.0,\"snr\":10.0,\"spreading\":\"SF9BW125\",\"status\":\"success\"}],\"id\":\"aa969c12-e1d1-4876-adb8-2b22f6c6a8fd\",\"metadata\":{\"adr_allowed\":false,\"labels\":[{\"id\":\"04c6e5fa-b377-402e-b433-1b2997c7035f\",\"name\":\"MySensors\",\"organization_id\":\"e5b3095d-1315-48d0-9530-a0954b904885\"},{\"id\":\"1048bdd0-745f-4e6f-8ee0-ab5b0c6ef2d5\",\"name\":\"HTTPInt\",\"organization_id\":\"e5b3095d-1315-48d0-9530-a0954b904885\"},{\"id\":\"66df035d-a4ba-4f76-bed2-3fabeac90ba2\",\"name\":\"Datacake\",\"organization_id\":\"e5b3095d-1315-48d0-9530-a0954b904885\"}],\"multi_buy\":1,\"organization_id\":\"e5b3095d-1315-48d0-9530-a0954b904885\"},\"name\":\"CubeCell\",\"payload\":\"AAAAAAAAAAAAAAAAANo=\",\"payload_size\":14,\"port\":2,\"reported_at\":1624734033986,\"uuid\":\"7667e570-ddbf-47f9-9384-59479780a8f3\"}",
              "endpoint" => "mqtt://broker.hivemq.com",
              "qos" => 0,
              "topic" => "helium/aa969c12-e1d1-4876-adb8-2b22f6c6a8fd/rx"
            }
          },
          "description" => "Request sent to <<\"AMmq\">>",
          "device_id" => "aa969c12-e1d1-4876-adb8-2b22f6c6a8fd",
          "id" => "7667e570-ddbf-47f9-9384-59479780a8f3",
          "reported_at" => timestamp,
          "sub_category" => "uplink_integration_req"
        })

      assert response(resp_conn, 200) # handles when the invalid Unicode code point (\u0000\) is in the body

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> post("/api/router/devices/#{device_0.id}/event", %{
          "category" => "uplink",
          "data" => %{
            "integration" => %{
              "id" => channel.id,
              "name" => "AMmq",
              "status" => "success"
            },
            "req" => %{
              "body" => "{\"app_eui\":\"6081F9856D334002\",\"decoded\":{\"payload\":{\"key_press\":\"\\u0001ú«X\\u0015%Ý\\u0000 b\\b\\u0002\\u0001\\u0007hS\\u0006s'*\\u0002g\\u0000ì\\u0004\\u00025Ä\\u0003qÿÿÿü$\"},\"status\":\"success\"},\"dev_eui\":\"90813481F4N5417\",\"devaddr\":\"06000098\",\"downlink_url\":\"https://console.helium.com/api/v1/down/\",\"fcnt\":135,\"hotspots\":[{\"channel\":14,\"frequency\":918.0,\"hold_time\":2934,\"id\":\"22Bb5Z7v4fN5g4cbX1uf3oHKKs6uYGun189ztAdGzd3ogLVPWsP\",\"lat\":-34.935295547741546,\"long\":138.59471168244602,\"name\":\"bouncy-dancing-lobster\",\"reported_at\":1627881788579,\"rssi\":-46.0,\"snr\":9.800000190734863,\"spreading\":\"SF10BW125\",\"status\":\"success\"}],\"id\":\"83gbbeb8-14ad-6789-ag33-1c02e093e275\",\"metadata\":{\"adr_allowed\":false,\"cf_list_enabled\":false,\"multi_buy\":1,\"organization_id\":\"36q4g683-b12e-7ce7-u8f0-d36251942c02\"},\"name\":\"somedevicename\",\"payload\":\"AYj6q1gVJd0AIGIIAgGUB2hTBnMnKgJnAOwEAjXEA3H/k////CQ=\",\"payload_size\":38,\"port\":8,\"reported_at\":1627881788579,\"uuid\":\"mhw1n5fn-5632-5895-g612-56893236456a\"}",
              "endpoint" => "mqtt://broker.hivemq.com",
              "qos" => 0,
              "topic" => "helium/aa969c12-e1d1-4876-adb8-2b22f6c6a8fd/rx"
            }
          },
          "description" => "Request sent to <<\"AMmq\">>",
          "device_id" => "aa969c12-e1d1-4876-adb8-2b22f6c6a8fd",
          "id" => "7667e570-ddbf-47f9-9384-59479780a8f3",
          "reported_at" => timestamp,
          "sub_category" => "uplink_integration_req"
        })

      assert response(resp_conn, 200) # handles when the invalid Unicode code point (\u0000) is in the body
    end
  end
end
