defmodule ConsoleWeb.OrganizationControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.Organizations

  describe "organizations" do
    setup [:authenticate_user]

    test "create organization properly", %{conn: conn} do
      resp_conn = post conn, organization_path(conn, :create), %{ "organization" => %{ "name" => "yes org" }}
      organization = json_response(resp_conn, 201)

      current_user = resp_conn.assigns.current_user
      assert Organizations.get_membership!(current_user, Organizations.get_organization!(organization["id"])) != nil
    end

    test "delete organization properly", %{conn: conn} do
      resp_conn = post conn, organization_path(conn, :create), %{ "organization" => %{ "name" => "yes org" }}
      organization = json_response(resp_conn, 201)
      current_user = resp_conn.assigns.current_user

      resp_conn = delete conn, organization_path(conn, :delete, organization["id"]), %{ "destination_org_id" => "no-transfer"}
      assert response(resp_conn, 202) # delete own org successfully

      another_org = insert(:organization)
      assert_error_sent 404, fn ->
        delete conn, organization_path(conn, :delete, another_org.id), %{ "destination_org_id" => "no-transfer"}
      end # cannot delete other orgs

      insert(:membership, %{ organization_id: another_org.id, user_id: current_user.id, email: current_user.email, role: "read" })
      resp_conn = delete conn, organization_path(conn, :delete, another_org.id), %{ "destination_org_id" => "no-transfer"}
      assert response(resp_conn, 403) # cannot delete org if user is not admin
    end

    test "cannot create organization with discovery mode org name", %{conn: conn} do
      resp_conn = post conn, organization_path(conn, :create), %{ "organization" => %{ "name" => "Discovery Mode (Helium)" }}
      assert response(resp_conn, 422)
    end
  end
end
