defmodule ConsoleWeb.InvitationControllerTest do
  use ConsoleWeb.ConnCase
  import Plug.Conn
  import Phoenix.ConnTest

  import Console.FactoryHelper
  import Console.Factory

  alias Console.Organizations

  describe "invitations" do
    setup [:authenticate_user]

    test "creates invitations properly", %{conn: conn} do
      current_organization_id = conn |> get_req_header("organization") |> List.first()
      another_org = insert(:organization)

      assert_error_sent 404, fn ->
        post conn, invitation_path(conn, :create), %{ "invitation" => %{}}
      end

      assert_error_sent 404, fn ->
        post conn, invitation_path(conn, :create), %{ "invitation" => %{ "organization" => another_org.id }}
      end

      resp_conn = post conn, invitation_path(conn, :create), %{ "invitation" => %{ "organization" => current_organization_id }}
      assert json_response(resp_conn, 422) == %{
        "errors" => %{
          "email" => ["Email is required"],
          "role" => ["Role is required"]
        }
      }

      resp_conn = post conn, invitation_path(conn, :create), %{
        "invitation" => %{
          "organization" => current_organization_id,
          "email" => "test@test",
          "role" => "read"
        }
      }
      assert json_response(resp_conn, 201)

      current_user = resp_conn.assigns.current_user

      resp_conn = post conn, invitation_path(conn, :create), %{
        "invitation" => %{
          "organization" => current_organization_id,
          "email" => current_user.email,
          "role" => "read"
        }
      }
      assert json_response(resp_conn, 403) # cannot invite yourself to org again
    end

    test "can accept invitations properly", %{conn: conn} do
      current_organization_id = conn |> get_req_header("organization") |> List.first()
      resp_conn = post conn, invitation_path(conn, :create), %{
        "invitation" => %{
          "organization" => current_organization_id,
          "email" => "test@test",
          "role" => "read"
        }
      }

      invitation =
        json_response(resp_conn, 201)
        |> Map.get("id")
        |> Organizations.get_invitation!()

      user = params_for(:user)
      {:ok, organization} = Organizations.create_organization(user, params_for(:organization))
      conn2 = conn
             |> put_req_header("accept", "application/json")
             |> put_req_header("authorization", user.id <> " " <> user.email)
             |> put_req_header("organization", organization.id)

      resp_conn = post conn2, user_join_from_invitation_path(conn2, :accept), %{
        "invitation" => %{
          "token" => invitation.token
        }
      }
      assert response(resp_conn, 200)
    end

    test "can delete invitations properly", %{conn: conn} do
      current_organization_id = conn |> get_req_header("organization") |> List.first()
      resp_conn = post conn, invitation_path(conn, :create), %{
        "invitation" => %{
          "organization" => current_organization_id,
          "email" => "test@test",
          "role" => "read"
        }
      }

      invitation =
        json_response(resp_conn, 201)
        |> Map.get("id")
        |> Organizations.get_invitation!()

      resp_conn = delete conn, invitation_path(conn, :delete, invitation.id)
      assert response(resp_conn, 204)

      resp_conn = post conn, invitation_path(conn, :create), %{
        "invitation" => %{
          "organization" => current_organization_id,
          "email" => "test@test",
          "role" => "read"
        }
      }
      invitation =
        json_response(resp_conn, 201)
        |> Map.get("id")
        |> Organizations.get_invitation!()

      user = params_for(:user)
      {:ok, organization} = Organizations.create_organization(user, params_for(:organization))
      conn2 = conn
             |> put_req_header("accept", "application/json")
             |> put_req_header("authorization", user.id <> " " <> user.email)
             |> put_req_header("organization", organization.id)

      post conn2, user_join_from_invitation_path(conn2, :accept), %{
        "invitation" => %{
          "token" => invitation.token
        }
      }

      resp_conn = delete conn, invitation_path(conn, :delete, invitation.id)
      assert response(resp_conn, 403)
    end
  end
end
