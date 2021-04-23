defmodule ConsoleWeb.AlertControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "alerts" do
    setup [:authenticate_user]

    test "creates alerts properly", %{conn: conn} do
      resp_conn = post conn, alert_path(conn, :create), %{ "alert" => %{ "node_type" => "device/group", "config" => %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"name" => ["Name cannot be blank"]}}
      
      resp_conn = post conn, alert_path(conn, :create), %{ "alert" => %{ "name" => "some name", "node_type" => "device/group", "config" => %{"email" => %{}, "webhook" => %{}} }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"message" => ["Alert must have at least one email or webhook setting turned on"]}}

      resp_conn = post conn, alert_path(conn, :create), %{ "alert" => %{ "name" => "some name", "node_type" => "device/group", "config" => %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } }}
      alert = json_response(resp_conn, 201)
      assert alert["name"] == "some name"
    end

    test "updates alerts properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      alert_1 = insert(:alert, %{ organization_id: organization_id, name: "alert name", node_type: "integration", config: %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } })

      resp_conn = put conn, alert_path(conn, :update, alert_1.id), %{ "alert" => %{ "name" => "", "node_type" => "device/group", "config" => %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"name" => ["Name cannot be blank"]}}

      resp_conn = put conn, alert_path(conn, :update, alert_1.id), %{ "alert" => %{ "name" => "some other name", "node_type" => "device/group", "config" => %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } }}
      alert = json_response(resp_conn, 200)
      assert alert["name"] == "some other name"

      resp_conn = put conn, alert_path(conn, :update, alert_1.id), %{ "alert" => %{ "config" => %{"email" => %{}, "webhook" => %{}} }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"message" => ["Alert must have at least one email or webhook setting turned on"]}}
    end

    test "deletes alerts properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      alert_1 = insert(:alert, %{ name: "alert name", node_type: "integration", config: %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } })
      assert_error_sent 404, fn ->
        delete conn, alert_path(conn, :delete, alert_1.id)
      end # does not delete alert not in own org

      alert_2 = insert(:alert, %{ organization_id: organization_id, name: "alert name", node_type: "integration", config: %{
        "email" => %{"device_join_otaa_first_time" => %{"recipient" => "admin"}},
        "webhook" => %{}
      } })
      resp_conn = delete conn, alert_path(conn, :delete, alert_2.id)
      assert response(resp_conn, 204)
    end
  end
end
