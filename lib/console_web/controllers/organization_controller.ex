defmodule ConsoleWeb.OrganizationController do
  use ConsoleWeb, :controller

  alias Console.Organizations.Organization
  alias Console.Organizations
  alias Console.Auth

  plug ConsoleWeb.Plug.AuthorizeAction when action in [:delete_organization]

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"organization" => %{ "name" => organization_name } }) do
    with {:ok, %Organization{} = organization} <- Organizations.create_organization(conn.assigns.current_user, %{ "name" => organization_name }) do
      organizations = Organizations.get_organizations(conn.assigns.current_user)
      case Enum.count(organizations) do
        1 ->
          jwt = Auth.generate_session_token(conn.assigns.current_user, organization)
          render(conn, "switch.json", jwt: jwt)
        _ ->
          broadcast(organization, conn.assigns.current_user, "create")

          conn
          |> put_status(:created)
          |> put_resp_header("message",  "#{organization.name} created successfully")
          |> render("show.json")
      end
    end
  end

  def delete_organization(conn, %{"id" => id}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id)
    with {:ok, %Organization{} = organization} <- Organizations.delete_organization(organization) do
      broadcast(organization, conn.assigns.current_user, "delete")

      conn
      |> put_status(:accepted)
      |> put_resp_header("message",  "#{organization.name} deleted successfully")
      |> render("index.json")
    end
  end

  defp broadcast(%Organization{} = organization, current_user, _) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, organization, organization_added: "#{current_user.id}/organization_added")
  end
end
