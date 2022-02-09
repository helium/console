defmodule ConsoleWeb.V1FlowControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "flows" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/flows")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end

    test "CRUD actions work properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      conn = build_conn() |> get("/api/v1/flows")
      assert response(conn, 401) # no api key

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/flows/test")
      assert response(resp_conn, 404) # cannot find flows with usable integration_id

      device = insert(:device, %{
        name: "My Device",
        app_key: "000000001111111100000000111111aa",
        app_eui: "000000001111111a",
        dev_eui: "000000001111111a",
        organization_id: organization.id
      })
      label = insert(:label, %{
        organization_id: organization.id
      })
      function = insert(:function, %{
        organization_id: organization.id
      })
      channel = insert(:channel, %{
        organization_id: organization.id
      })

      flow1 = insert(:flow, %{ device_id: device.id, channel_id: channel.id, organization_id: organization.id })
      flow2 = insert(:flow, %{ label_id: label.id, channel_id: channel.id, organization_id: organization.id })

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/flows/#{channel.id}")
      assert response(resp_conn, 404) # cannot find flows wrong path

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/flows?integration_id=#{channel.id}")
      assert json_response(resp_conn, 200) |> length() == 2 # found 2 flows

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/flows/#{flow1.id}")
      assert response(resp_conn, 200) # delete flow 1

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/flows/#{flow2.id}")
      assert response(resp_conn, 200) # delete flow 2

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/flows?integration_id=#{channel.id}")
      assert json_response(resp_conn, 200) |> length() == 0 # found 0 flows after delete

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/flows", %{
          integration_id: channel.id,
          function_id: function.id,
          device_id: device.id
        })
      assert response(resp_conn, 200) # created flow

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/flows", %{
          integration_id: channel.id,
          function_id: function.id,
          label_id: label.id
        })
      assert response(resp_conn, 200) # created flow

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/flows", %{
          integration_id: channel.id,
          function_id: function.id,
          label_id: label.id,
          device_id: device.id
        })
      assert response(resp_conn, 400) # cannot create flow with both label and device

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/flows", %{
          integration_id: channel.id,
          function_id: function.id,
          device_id: device.id
        })
      assert response(resp_conn, 422) # cannot create flow that exists
    end
  end
end
