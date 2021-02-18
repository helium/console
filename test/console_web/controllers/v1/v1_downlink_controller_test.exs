defmodule ConsoleWeb.V1DownlinkControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "downlink" do
    test "queues a down properly", %{conn: conn} do
      azure_channel = insert(:channel, %{ downlink_token: "token1" })
      resp_conn = build_conn() |> post("/api/v1/down/#{azure_channel.id}/#{azure_channel.downlink_token}")
      assert response(resp_conn, 400) # not http channel cannot downlink

      channel = insert(:channel, %{ downlink_token: "token2", type: "http" })
      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/token3")
      assert response(resp_conn, 400) # wrong token cannot downlink

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}")
      assert response(resp_conn, 422) # no devices linked to channel cannot downlink

      organization = insert(:organization)
      label = insert(:label)
      device_1 = insert(:device, %{ organization_id: organization.id })
      device_2 = insert(:device, %{ organization_id: organization.id })
      device_3 = insert(:device, %{ organization_id: organization.id })
      insert(:devices_labels, %{ label_id: label.id, device_id: device_1.id })
      insert(:devices_labels, %{ label_id: label.id, device_id: device_2.id })
      insert(:channels_labels, %{ label_id: label.id, channel_id: channel.id })

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}")
      assert response(resp_conn, 200) # multiple devices linked downlink works

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}/#{device_1.id}")
      assert response(resp_conn, 200) # device linked downlink works

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}/#{device_3.id}")
      assert response(resp_conn, 422) # device not linked downlink does not work

      resp_conn = build_conn() |> post("/api/v1/clear_downlink_queue", %{ "devices" => [device_1.id]})
      assert response(resp_conn, 200) # clearing queue for one device works

      resp_conn = build_conn() |> post("/api/v1/clear_downlink_queue", %{ "devices" => [device_1.id, device_2.id]})
      assert response(resp_conn, 200) # clearing queue for two devices works

      resp_conn = build_conn() |> post("/api/v1/clear_downlink_queue", %{ "devices" => []})
      assert response(resp_conn, 400) # clearing queue for no devices does not work
    end
  end
end
