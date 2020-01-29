defmodule ConsoleWeb.OrganizationControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory
  alias Console.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    setup [:authenticate_user]

    test "lists all teams for a user", %{conn: conn, team: team} do
      {:ok, _, team_b, _} = Console.Auth.create_user(params_for(:user, %{password: "password"}), %{name: "Test Team2"}, %{name: "Test Organization2"})

      conn = get conn, team_path(conn, :index)
      team_ids = for t <- json_response(conn, 200), do: t["id"]
      assert Enum.find(team_ids, fn x -> x == team.id end) != nil
      assert Enum.find(team_ids, fn x -> x == team_b.id end) == nil
    end

    test "create a new team under an existing organization works", %{conn: conn, organization: organization} do
      conn = post conn, team_path(conn, :create), %{ "team" => params_for(:team), "organization" => %{ "id" => organization.id } }
      assert json_response(conn, 201)

      conn = post conn, team_path(conn, :create), %{ "team" => %{ "name" => "a" }, "organization" => %{ "id" => organization.id } }
      assert json_response(conn, 422)
    end
  end

  describe "create" do
    setup [:authenticate_user]

    test "create a new org and team works", %{conn: conn, user: user} do
      conn = post conn, team_path(conn, :create), %{ "team" => params_for(:team), "organization" => params_for(:organization) }
      assert json_response(conn, 201)

      conn = post conn, team_path(conn, :create), %{ "team" => %{ "name" => "a" }, "organization" => params_for(:organization) }
      assert json_response(conn, 422)

      conn = post conn, team_path(conn, :create), %{ "team" => %{ }, "organization" => params_for(:organization) }
      assert json_response(conn, 422)

      conn = post conn, team_path(conn, :create), %{ "team" => params_for(:team), "organization" => %{ "name" => "a" } }
      assert json_response(conn, 422)
    end
  end

  describe "create no org" do
    setup [:authenticate_user]

    test "create a new org and team works for user with no org", %{conn: conn, user: user, organization: organization} do
      delete conn, "/api/organizations/#{organization.id}"
      assert Organizations.list_organizations() == []

      token = Console.Auth.generate_session_token(user, nil)
      conn = conn
             |> put_req_header("accept", "application/json")
             |> put_req_header("authorization", "bearer: " <> token)

      conn = post conn, team_path(conn, :create), %{ "team" => params_for(:team), "organization" => params_for(:organization) }
      assert json_response(conn, 200)
      assert Organizations.list_organizations() |> Enum.count() == 1
    end
  end

  describe "delete team from org" do
    setup [:authenticate_user]

    test "delete team works", %{conn: conn, organization: organization, team: team} do
      assert Organizations.fetch_assoc(organization, [:teams]).teams |> Enum.count() == 1
      post conn, team_path(conn, :create), %{ "team" => params_for(:team), "organization" => %{ "id" => organization.id } }
      assert Organizations.fetch_assoc(organization, [:teams]).teams |> Enum.count() == 2
      conn = delete conn, team_path(conn, :delete, team.id)
      assert json_response(conn, 202)
      team_leftover = Organizations.fetch_assoc(organization, [:teams]).teams |> List.first()
      assert team_leftover.id != team.id
    end
  end

  describe "delete org" do
    setup [:authenticate_user]

    test "delete org works", %{conn: conn, organization: organization} do
      assert Organizations.list_organizations() |> Enum.count() == 1
      conn = delete conn, "/api/organizations/#{organization.id}"
      assert json_response(conn, 202)
      assert Organizations.list_organizations() == []
    end
  end
end
