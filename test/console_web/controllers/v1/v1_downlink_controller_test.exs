defmodule ConsoleWeb.V1DownlinkControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "downlink" do
    test "queues a down properly", %{conn: _conn} do
      azure_channel = insert(:channel, %{ downlink_token: "token1" })
      resp_conn = build_conn() |> post("/api/v1/down/#{azure_channel.id}/#{azure_channel.downlink_token}")
      assert response(resp_conn, 400) # not http channel cannot downlink

      organization = insert(:organization)
      channel = insert(:channel, %{ downlink_token: "token2", type: "http", organization_id: organization.id })
      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/token3")
      assert response(resp_conn, 400) # wrong token cannot downlink

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}")
      assert response(resp_conn, 400) # no devices linked to channel cannot downlink

      label = insert(:label)
      device_1 = insert(:device, %{ organization_id: organization.id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })
      device_2 = insert(:device, %{ organization_id: organization.id, dev_eui: "2222222222222222", app_eui: "2222222222222222", app_key: "22222222222222222222222222222222" })
      device_3 = insert(:device, %{ organization_id: organization.id, dev_eui: "3333333333333333", app_eui: "3333333333333333", app_key: "33333333333333333333333333333333" })
      insert(:devices_labels, %{ label_id: label.id, device_id: device_1.id })
      insert(:devices_labels, %{ label_id: label.id, device_id: device_2.id })
      insert(:flow, %{ label_id: label.id, channel_id: channel.id, organization_id: organization.id })

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}")
      assert response(resp_conn, 200) # multiple devices linked downlink works

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}/#{device_1.id}")
      assert response(resp_conn, 200) # device linked downlink works

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}/#{device_3.id}")
      assert response(resp_conn, 400) # device not linked downlink does not work

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}/#{device_1.id}", %{
        "region" => "whatever"
      })
      assert response(resp_conn, 400) # unsupported/invalid region in downlink payload does not work

      resp_conn = build_conn() |> post("/api/v1/down/#{channel.id}/#{channel.downlink_token}/#{device_1.id}", %{
        "region" => "AU915"
      })
      assert response(resp_conn, 200) # supported region in downlink payload works
    end
  end
end
