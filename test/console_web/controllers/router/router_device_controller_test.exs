defmodule ConsoleWeb.RouterDeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "devices" do
    test "router can get devices by dev and app eui", %{conn: conn} do
      resp_conn = build_conn() |> post("/api/router/sessions", %{ "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/" })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id })

      resp_conn = build_conn() |> get("/api/router/devices/yolo?app_eui=#{device_0.app_eui}&dev_eui=#{device_0.dev_eui}")
      assert response(resp_conn, 401) # unauthenticated

      resp_conn = build_conn() |> put_req_header("authorization", "Bearer " <> jwt) |> get("/api/router/devices/yolo?app_eui=#{device_0.app_eui}&dev_eui=#{device_0.dev_eui}")
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

      resp_conn = build_conn() |> put_req_header("authorization", "Bearer " <> jwt) |> get("/api/router/devices/yolo?app_eui=#{device_1.app_eui}&dev_eui=#{device_1.dev_eui}")
      devices_json = json_response(resp_conn, 200)
      assert devices_json |> List.first() |> Map.get("channels") |> length() == 1

      device_2 = insert(:device, %{ organization_id: organization.id })
      channel_2 = insert(:channel, %{ organization_id: organization.id })
      channel_3 = insert(:channel, %{ organization_id: organization.id })
      label_3 = insert(:label, %{ organization_id: organization.id })
      insert(:devices_labels, %{ device_id: device_2.id, label_id: label_3.id })
      insert(:channels_labels, %{ channel_id: channel_2.id, label_id: label_3.id })
      insert(:channels_labels, %{ channel_id: channel_3.id, label_id: label_3.id })

      resp_conn = build_conn() |> put_req_header("authorization", "Bearer " <> jwt) |> get("/api/router/devices/yolo?app_eui=#{device_2.app_eui}&dev_eui=#{device_2.dev_eui}")
      devices_json = json_response(resp_conn, 200)
      assert devices_json |> List.first() |> Map.get("channels") |> length() == 2
    end

    test "router can get single device by id", %{conn: conn} do
      resp_conn = build_conn() |> post("/api/router/sessions", %{ "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/" })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id })

      resp_conn = build_conn() |> put_req_header("authorization", "Bearer " <> jwt) |> get("/api/router/devices/#{device_0.id}")
      assert json_response(resp_conn, 200)
    end

    test "router add event to device event log", %{conn: conn} do
      resp_conn = build_conn() |> post("/api/router/sessions", %{ "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/" })
      token = json_response(resp_conn, 201)
      jwt = token["jwt"] # get session token

      organization = insert(:organization)
      device_0 = insert(:device, %{ organization_id: organization.id })
      timestamp = NaiveDateTime.utc_now() |> NaiveDateTime.diff(~N[1970-01-01 00:00:00])

      resp_conn = build_conn()
        |> put_req_header("authorization", "Bearer " <> jwt)
        |> post("/api/router/devices/#{device_0.id}/event", %{
          "category" => "up",
          "description" => "test description",
          "reported_at" => timestamp,
          "frame_up" => 2,
          "frame_down" => 10,
          "payload" => "payload",
          "payload_size" => 2,
          "port" => 1,
          "devaddr" => "yesssss",
          "hotspots" => [
            %{
              "id" => "hotspot_id2",
              "name" => "hotspot name",
              "reported_at" => timestamp,
              "status" => "success",
              "rssi" => -30,
              "snr" => 0.2,
              "spreading" => "SF9BW125",
              "frequency" => 923.3
            }
          ],
          "channels" => [
            %{
              "id" => "uuid2",
              "name" => "channel name",
              "reported_at" => timestamp,
              "status" => "success",
              "description" => "what happened",
              "debug" => %{
              	"req" => %{
              		"body" => "{\"app_eui\":\"DC10DEE2C0381F05\",\"dev_eui\":\"73BA0F7B47FCB3F6\",\"devaddr\":\"E2DE10DC\",\"fcnt\":9753,\"hotspots\":[{\"frequency\":913.0999755859375,\"id\":\"11tkAbgqHU2qU7GTiuwjggEDaYsmRDsbPsJjw5ezsu54coQE7Cu\",\"name\":\"fancy-fossilized-moose\",\"reported_at\":1586977541,\"rssi\":-64.0,\"snr\":12.0,\"spreading\":\"SF9BW125\",\"status\":\"success\"}],\"id\":\"a9bccdd2-ff89-47d0-b60f-8f01634c195f\",\"metadata\":{\"labels\":[{\"id\":\"aae7f89c-b6e8-49e8-9ea4-7e1109f54d87\",\"name\":\"RequestBin\",\"organization_id\":\"847e51db-25bd-4ff5-8fc3-33b459a68a22\"}]},\"name\":\"Pierre-Test-Device\",\"payload\":\"SGVsbG8sIHdvcmxkIQ==\",\"port\":1,\"reported_at\":1586977541}",
              		"headers" => %{"Content-Type" => "application/json"},
              		"method" => "post",
              		"url" => "https://enssngw32yjbk.x.pipedream.net/"
              	}
              }
            }
          ]
        })

      assert response(resp_conn, 200)
    end
  end
end
