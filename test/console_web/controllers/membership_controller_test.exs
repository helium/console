defmodule ConsoleWeb.MembershipControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  alias Console.Organizations

  describe "invitations" do
    setup [:authenticate_user]

    test "updates memberships properly", %{conn: conn} do
      current_organization_id = conn |> get_req_header("organization") |> List.first()
      another_org = insert(:organization)
      another_user = build(:user)
      another_membership = insert(:membership, %{ organization_id: another_org.id, user_id: another_user.id, email: another_user.email, role: "read" })

      assert_error_sent 404, fn ->
        put conn, membership_path(conn, :update, another_membership.id), %{ "membership" => %{}}
      end # cannot update membership of someone not in current org

      membership = insert(:membership, %{ organization_id: current_organization_id, user_id: another_user.id, email: another_user.email, role: "read" })
      assert membership.role == "read"
      resp_conn = put conn, membership_path(conn, :update, membership.id), %{ "membership" => %{ "role" => "admin" }}
      assert json_response(resp_conn, 200)
      membership = Organizations.get_membership!(membership.id)
      assert membership.role == "admin" # updates membership of someone else successfully

      current_user = resp_conn.assigns.current_user
      current_membership = Organizations.get_membership!(current_user, Organizations.get_organization!(current_organization_id))
      resp_conn = put conn, membership_path(conn, :update, current_membership.id), %{ "membership" => %{ "role" => "admin" }}
      assert json_response(resp_conn, 403) # cannot update your own membership
    end

    test "can delete memberships properly", %{conn: conn} do
      current_organization_id = conn |> get_req_header("organization") |> List.first()
      another_org = insert(:organization)
      another_user = build(:user)
      another_membership = insert(:membership, %{ organization_id: another_org.id, user_id: another_user.id, email: another_user.email, role: "read" })

      assert_error_sent 404, fn ->
        delete conn, membership_path(conn, :delete, another_membership.id)
      end # cannot delete membership of someone not in current org

      membership = insert(:membership, %{ organization_id: current_organization_id, user_id: another_user.id, email: another_user.email, role: "read" })
      assert membership.role == "read"
      resp_conn = delete conn, membership_path(conn, :delete, membership.id)
      assert response(resp_conn, 204)
      membership = Organizations.get_membership(membership.id)
      assert membership == nil # deletes successfully

      current_user = resp_conn.assigns.current_user
      current_membership = Organizations.get_membership!(current_user, Organizations.get_organization!(current_organization_id))
      resp_conn = delete conn, membership_path(conn, :delete, current_membership.id)
      assert json_response(resp_conn, 403) # cannot delete your own membership
    end
  end
end
