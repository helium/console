defmodule ConsoleWeb.TeamControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Teams
  import Console.FactoryHelper
  import Console.Factory

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "create team" do
    setup [:authenticate_user]

    test "renders team when data is valid", %{conn: conn} do
      team_attrs = %{name: "Test Team"}
      conn = post conn, team_path(conn, :create), team: team_attrs
      assert %{"name" => "Test Team"} = json_response(conn, 201)
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, team_path(conn, :create), team: %{name: "short"}
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

end
