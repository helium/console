defmodule ConsoleWeb.ApiKeyControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.ApiKeys

  describe "api keys" do
    setup [:authenticate_user]

    test "creates api keys properly", %{conn: conn} do
      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "role" => "admin" }}
      assert response(resp_conn, 422) # no name

      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "", "role" => "admin" }}
      assert response(resp_conn, 422) # empty name

      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes", "role" => "manager" }}
      assert response(resp_conn, 422) # role invalid

      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes", "role" => "admin" }}
      assert response(resp_conn, 201)

      key = json_response(resp_conn, 201)
      assert key["organization_id"] == resp_conn.assigns.current_organization.id

      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes", "role" => "admin" }}
      assert response(resp_conn, 422) # name already used

      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes1", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes2", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes3", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes4", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes5", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes6", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes7", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes8", "role" => "admin" }}
      post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes9", "role" => "admin" }}
      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "no more", "role" => "admin" }}
      assert response(resp_conn, 403) # create only 10 api keys max
    end

    test "deletes api keys properly", %{conn: conn} do
      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes", "role" => "admin" }}
      key = json_response(resp_conn, 201)

      another_api_key = insert(:api_key)
      assert_error_sent 404, fn ->
        delete conn, api_key_path(conn, :delete, another_api_key.id)
      end # does not delete another org key

      resp_conn = delete conn, api_key_path(conn, :delete, key["id"])
      assert response(resp_conn, 204) # valid delete
    end

    test "accepts api keys properly", %{conn: conn} do
      resp_conn = post conn, api_key_path(conn, :create), %{ "api_key" => %{ "name" => "yes", "role" => "admin" }}
      key = json_response(resp_conn, 201)
      key = ApiKeys.get_api_key!(resp_conn.assigns.current_organization, key["id"])

      conn = get(build_conn(), "/api_keys/accept/" <> key.token)
      assert conn.private.phoenix_flash == %{"info" => "Your API key is now activated"}

      conn = get(build_conn(), "/api_keys/accept/" <> "bs")
      assert conn.private.phoenix_flash == %{"error" => "Invalid API Key token provided"}
    end
  end
end
