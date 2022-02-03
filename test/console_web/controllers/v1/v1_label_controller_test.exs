defmodule ConsoleWeb.V1LabelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.Labels

  describe "labels" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/labels")
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

      conn = build_conn() |> get("/api/v1/labels")
      assert response(conn, 401) # no api key

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/labels")
      assert json_response(resp_conn, 200) == [] # returns no labels when no labels created in org

      assert_error_sent 400, fn ->
        build_conn() |> put_req_header("key", key) |> post("/api/v1/labels", %{})
      end # not all label attrs in body

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels", %{ "name" => "label" })
      label = json_response(resp_conn, 201) # create success

      insert(:organization)
      label_2 = insert(:label)

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/labels")
      assert json_response(resp_conn, 200) |> length() == 1
      assert json_response(resp_conn, 200) |> List.first() |> Map.get("id") == label["id"] # index only shows our labels in our org

      assert Labels.get_label(label["id"]) != nil
      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/labels/#{label["id"]}")
      assert response(resp_conn, 200) # label delete works
      assert Labels.get_label(label["id"]) == nil

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/labels/#{label_2.id}")
      assert response(resp_conn, 404) # label delete does not work for label not in org
    end

    test "linking and unlinking labels and devices work properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/labels", %{ "name" => "label" })
      label = json_response(resp_conn, 201) # create a label in org
      label = Labels.get_label!(label["id"])
      assert label.organization_id == organization.id

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          "name" => "device",
          "dev_eui" => "1111111111111111",
          "app_eui" => "1111111111111111",
          "app_key" => "11111111111111111111111111111111"
        })
      device = json_response(resp_conn, 201) # create a device in org
      assert device["organization_id"] == organization.id

      label = Labels.fetch_assoc(label, [:devices])
      assert label.devices |> length() == 0
      assert_error_sent 400, fn ->
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/devices/#{device["id"]}/labels", %{ "label" => "id" })
      end # label_id not valid

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices/#{device["id"]}/labels", %{ "label" => label.id })
      assert response(resp_conn, 200) == "Device added to label successfully"

      label = Labels.get_label!(label.id)
      label = Labels.fetch_assoc(label, [:devices])
      assert label.devices |> length() == 1

      assert_error_sent 400, fn ->
        build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/a/labels/b")
      end # delete does not work when ids are wrong

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device["id"]}/labels/#{label.id}")
      assert response(resp_conn, 200) == "Device removed from label successfully"

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device["id"]}/labels/#{label.id}")
      assert response(resp_conn, 200) == "Device was not in label"
    end
  end
end
