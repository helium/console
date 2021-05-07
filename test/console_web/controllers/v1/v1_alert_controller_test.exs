defmodule ConsoleWeb.V1AlertControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "alerts" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/alerts")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end
  end
end