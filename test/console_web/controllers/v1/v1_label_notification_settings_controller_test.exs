defmodule ConsoleWeb.V1LabelNotificationSettingsControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.LabelNotificationSettings

  describe "label notification settings" do
    test "inactive api keys do not work", %{conn: conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/some_long_id/notification_email")
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
      build_conn() |> post("/api/v1/labels/some_long_id/notification_email")
    end # no api key attached

    assert_error_sent 400, fn ->
      build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/some_long_id/notification_email", %{})
    end # no attrs in body

    label_1 = insert(:label)
    resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/#{label_1.id}/notification_email", %{ "key" => "device_stops_transmitting", "value" => "30", "recipients" => "all" })
    assert response(resp_conn, 202)

    label_2 = insert(:label)
    resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/#{label_2.id}/notification_email", %{ "key" => "invalid_key", "value" => "30", "recipients" => "all" })
    assert response(resp_conn, 400) # invalid key not allowed

    resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels/#{label_2.id}/notification_email", %{ "key" => "device_deleted", "value" => "0", "recipients" => "invalid_recipient" })
    assert response(resp_conn, 400) # invalid recipients not allowed
  end
end