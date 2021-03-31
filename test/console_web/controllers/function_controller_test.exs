defmodule ConsoleWeb.FunctionControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  alias Console.Functions

  describe "functions" do
    setup [:authenticate_user]

    test "creates functions properly", %{conn: conn} do
      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "type" => "decoder", "format" => "cayenne" }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"name" => ["can't be blank"]}}

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "format" => "cayenne" }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"type" => ["can't be blank"]}}

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "type" => "notdecoder", "format" => "cayenne" }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"type" => ["is invalid"]}}

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "type" => "decoder", "format" => "cayenne2" }}
      assert json_response(resp_conn, 422) # format must be in list of valid choices

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "type" => "decoder", "format" => "cayenne", "body" => "none" }}
      function = json_response(resp_conn, 201)
      assert function["body"] != "none" # cayenne format with body, body is ignored
      function = Functions.get_function!(function["id"])
      assert function.organization_id == conn |> get_req_header("organization") |> List.first() # make sure org id generated automatically

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "type" => "decoder", "format" => "cayenne" }}
      assert json_response(resp_conn, 422) # cannot use same name

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function2", "type" => "decoder", "format" => "browan_object_locator", "body" => "none" }}
      function = json_response(resp_conn, 201)
      assert function["body"] != "none" # browan format with body, body is ignored

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function3", "type" => "decoder", "format" => "custom" }}
      assert json_response(resp_conn, 422) # no body attr for custom

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function3", "type" => "decoder", "format" => "custom", "body" => "random code" }}
      function = json_response(resp_conn, 201)
      assert function["body"] == "random code" # custom body for custom format will be used
    end

    test "create functions with labels linked properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      label_1 = insert(:label, %{ organization_id: organization_id })
      label_2 = insert(:label, %{ organization_id: organization_id })
      label_3 = insert(:label) # not inserted into same organization

      resp_conn = post conn, function_path(conn, :create), %{
        "function" => %{
          "name" => "function",
          "type" => "decoder",
          "format" => "cayenne",
          "body" => "none",
          "labels" => %{
            "labelsApplied" => [label_1.id, label_2.id],
            "newLabels" => ["test_label1", "test_label2"]
          }
        }
      }
      function = json_response(resp_conn, 201)
      function = Functions.get_function!(function["id"]) |> Functions.fetch_assoc([:labels])
      assert Enum.find(function.labels, fn l -> l.id == label_1.id end)
      assert Enum.find(function.labels, fn l -> l.id == label_2.id end)
      assert Enum.find(function.labels, fn l -> l.name == "test_label1" end)
      assert Enum.find(function.labels, fn l -> l.name == "test_label2" end)
      assert Enum.find(function.labels, fn l -> l.id == label_3.id end) == nil
    end

    test "updates functions properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_function = insert(:function, %{ organization_id: not_my_org.id })
      assert_error_sent 404, fn ->
        put conn, function_path(conn, :update, not_my_function.id), %{ "function" => %{ "name" => "function2" }}
      end # does not update function not in own org

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "type" => "decoder", "format" => "cayenne", "body" => "none" }}
      function = json_response(resp_conn, 201)
      assert function["name"] == "function"

      resp_conn = put conn, function_path(conn, :update, function["id"]), %{ "function" => %{ "name" => "function2" }}
      function = json_response(resp_conn, 200)
      assert function["name"] == "function2" # updating name

      assert function["format"] == "cayenne" # updating name
      resp_conn = put conn, function_path(conn, :update, function["id"]), %{ "function" => %{ "format" => "custom" }}
      function = json_response(resp_conn, 200)
      assert function["format"] == "custom" # updating format from cayenne
      assert function["body"] == "Default Cayenne Function"
    end

    test "delete functions properly", %{conn: conn} do
      not_my_org = insert(:organization)
      not_my_function = insert(:function, %{ organization_id: not_my_org.id })
      assert_error_sent 404, fn ->
        delete conn, function_path(conn, :delete, not_my_function.id)
      end # does not delete function not in own org

      resp_conn = post conn, function_path(conn, :create), %{ "function" => %{ "name" => "function", "type" => "decoder", "format" => "cayenne", "body" => "none" }}
      function = json_response(resp_conn, 201)

      assert Functions.get_function(function["id"]) != nil

      resp_conn = delete conn, function_path(conn, :delete, function["id"])
      assert response(resp_conn, 204)

      assert Functions.get_function(function["id"]) == nil
    end
  end
end
