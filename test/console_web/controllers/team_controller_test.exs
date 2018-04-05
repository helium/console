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
      user_a = Console.Auth.fetch_assoc(user_a)
      user_b = insert(:user)
      Console.Teams.create_team(user_b, %{name: "User B Team"})
      conn = get conn, team_path(conn, :index)
      team_ids = for t <- json_response(conn, 200), do: t["id"]
      user_a_team_ids = for t <- user_a.teams, do: t.id
      assert team_ids == user_a_team_ids
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
      conn = post conn, team_path(conn, :create), team: %{name: "s"}
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

end
