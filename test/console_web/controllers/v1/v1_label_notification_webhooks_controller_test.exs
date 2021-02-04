defmodule ConsoleWeb.V1LabelNotificationWebhooksControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.LabelNotificationWebhooks

  describe "label notification webhooks" do
    test "inactive api keys do not work", %{conn: conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/some_long_id/notification_webhook")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end
  end

  test "update works properly", %{conn: conn} do
    key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
    organization = insert(:organization)
    api_key = insert(:api_key, %{
      organization_id: organization.id,
      key: :crypto.hash(:sha256, key),
      active: true
    })

    assert_error_sent 500, fn ->
      build_conn() |> post("/api/v1/labels/some_long_id/notification_webhook")
    end # no api key attached

    assert_error_sent 400, fn ->
      build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/some_long_id/notification_webhook", %{})
    end # no attrs in body

    label_1 = insert(:label)
    resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/#{label_1.id}/notification_webhook", %{ "key" => "device_stops_transmitting", "value" => "30", "url" => "http://hello.com", "notes" => "hi" })
    assert response(resp_conn, 202) # valid with notes field

    label_2 = insert(:label)
    resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/#{label_2.id}/notification_webhook", %{ "key" => "invalid_key", "value" => "30", "url" => "http://hi.com" })
    assert response(resp_conn, 403) # invalid key not allowed

    label_3 = insert(:label)
    resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/#{label_3.id}/notification_webhook", %{ "key" => "device_stops_transmitting", "value" => "30", "url" => "http://hello.com" })
    assert response(resp_conn, 202) # valid without notes field
  end
end