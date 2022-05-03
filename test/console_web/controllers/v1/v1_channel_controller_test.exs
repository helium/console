defmodule ConsoleWeb.V1ChannelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "channels" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/integrations")
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

      conn = build_conn() |> get("/api/v1/integrations")
      assert response(conn, 401) # no api key

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/integrations")
      assert json_response(resp_conn, 200) == [] # no channels added to db yet

      assert_error_sent 400, fn ->
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/integrations/community", %{ "name" => "test", "token" => "11234556234" })
      end # missing type attr for channel create

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/integrations/community", %{ "name" => "test", "token" => "11234556234", "type" => "tago" })
      tago = json_response(resp_conn, 201) # properly create valid channel

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/integrations/community", %{ "name" => "test2", "token" => "11234sgasdf556234", "type" => "datacake" })
      datacake = json_response(resp_conn, 201) # properly create valid channel

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/integrations")
      assert json_response(resp_conn, 200) |> length() == 2 # found 2 created channels

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/integrations/#{tago["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("id") == tago["id"] # search by id works

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/integrations?name=#{datacake["name"]}")
      assert json_response(resp_conn, 200) |> Map.get("id") == datacake["id"] # search by name works

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/integrations/#{datacake["id"]}")
      assert json_response(resp_conn, 200) # delete works

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/integrations")
      assert json_response(resp_conn, 200) |> length() == 1 # found 1 created channels
    end
  end
end
