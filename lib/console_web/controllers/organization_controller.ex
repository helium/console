defmodule ConsoleWeb.OrganizationController do
  use ConsoleWeb, :controller

  alias Console.Organizations.Organization
  alias Console.Organizations
  alias Console.Auth
  alias Console.Auth.User

  plug ConsoleWeb.Plug.AuthorizeAction when action in [:delete]

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _) do
    organizations = Organizations.get_organizations(conn.assigns.current_user)
    conn
    |> put_status(:ok)
    |> render("index.json", organizations: organizations)
  end

  def create(conn, %{"organization" => %{ "name" => organization_name } }) do
    with {:ok, %Organization{} = organization} <-
      Organizations.create_organization(conn.assigns.current_user, %{ "name" => organization_name }) do
      organizations = Organizations.get_organizations(conn.assigns.current_user)
      membership = Organizations.get_membership!(conn.assigns.current_user, organization)
      membership_info = %{id: organization.id, name: organization.name, role: membership.role}
      case Enum.count(organizations) do
        1 ->
          Organizations.update_organization(organization, %{ "dc_balance" => 10000 })

          render(conn, "show.json", organization: membership_info)
        _ ->
          broadcast(organization, conn.assigns.current_user)

          conn
          |> put_status(:created)
          |> put_resp_header("message",  "#{organization.name} created successfully")
          |> render("show.json", organization: membership_info)
      end
    end
  end

  def delete(conn, %{"id" => id, "destination_org_id" => destination_org_id}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id)
    membership = Organizations.get_membership!(conn.assigns.current_user, organization)
    if membership.role != "admin" do
      {:error, :forbidden, "You don't have access to do this"}
    else
      balance_left = organization.dc_balance
      destination_org =
        case destination_org_id do
          "no-transfer" -> nil
          _ -> Organizations.get_organization(conn.assigns.current_user, destination_org_id)
        end

      if balance_left != nil and balance_left > 0 and destination_org != nil do
        {:ok, {:ok, from_org_updated, to_org_updated }} = Organizations.send_dc_to_org(balance_left, organization, destination_org)
        ConsoleWeb.DataCreditController.broadcast(from_org_updated)
        ConsoleWeb.DataCreditController.broadcast(to_org_updated)
        ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(from_org_updated)
        ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(to_org_updated)
      end

      with {:ok, _} <- Organizations.delete_organization(organization) do
        broadcast(organization, conn.assigns.current_user)
        render_org = %{id: organization.id, name: organization.name, role: membership.role}
        conn
        |> put_status(:accepted)
        |> put_resp_header("message",  "#{organization.name} deleted successfully")
        |> render("show.json", organization: render_org)
      end
    end
  end

  defp broadcast(%Organization{} = organization, current_user) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, organization, organization_added: "#{current_user.id}/organization_added")
  end
end
