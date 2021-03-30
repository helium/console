defmodule ConsoleWeb.V1OrganizationControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "organizations" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/organization")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end

    test "gets organization properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      assert_error_sent 500, fn ->
        build_conn() |> get("/api/v1/organization")
      end # no api key attached

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/organization")
      assert json_response(resp_conn, 200)["id"] == organization.id
      assert json_response(resp_conn, 200)["name"] == organization.name
    end
  end
end
