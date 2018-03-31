defmodule ConsoleWeb.TeamControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    setup [:authenticate_user]

    test "lists all teams for a user", %{conn: conn, user: user_a} do
      user_b = insert(:user)
      Console.Teams.create_team(user_a, %{name: "User A Team"})
      Console.Teams.create_team(user_b, %{name: "User B Team"})
      conn = get conn, team_path(conn, :index)
      assert length(json_response(conn, 200)) == 1
      assert List.first(json_response(conn, 200))["name"] == "User A Team"
    end
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
