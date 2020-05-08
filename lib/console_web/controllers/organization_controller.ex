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
      case Enum.count(organizations) do
        1 ->
          render(conn, "show.json", organization: organization)
        _ ->
          broadcast(organization, conn.assigns.current_user)

          conn
          |> put_status(:created)
          |> put_resp_header("message",  "#{organization.name} created successfully")
          |> render("show.json", organization: organization)
      end
    end
  end

  def switch(conn, %{"organization_id" => id}) do
    with %Organization{} = organization <- Organizations.get_organization(conn.assigns.current_user, id) do
      jwt = Auth.generate_session_token(conn.assigns.current_user, organization)
      render(conn, "switch.json", jwt: jwt)
    end
  end

  def delete(conn, %{"id" => id}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id)
    membership = Organizations.get_membership!(conn.assigns.current_user, organization)
    if membership.role != "admin" do
      {:error, :forbidden, "You don't have access to do this"}
    else
      with {:ok, _} <- Organizations.delete_organization(organization) do
        broadcast(organization, conn.assigns.current_user)

        conn
        |> put_status(:accepted)
        |> put_resp_header("message",  "#{organization.name} deleted successfully")
        |> render("show.json", organization: organization)
      end
    end
  end

  defp broadcast(%Organization{} = organization, current_user) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, organization, organization_updated: "#{current_user.id}/organization_updated")
  end
end
