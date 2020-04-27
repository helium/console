defmodule ConsoleWeb.Plug.PutCurrentOrganization do
  alias Console.Organizations
  alias Console.Organizations.Organization
  alias Console.Organizations.Membership

  import Plug.Conn, only: [assign: 3, send_resp: 3, halt: 1, get_req_header: 2]

  def init(default), do: default

  def call(conn, _default) do
    # Replace the following with a check for supplied organization being valid
    current_user = conn.assigns.current_user
    organization_id = if conn.params["organization_id"] do
        conn.params["organization_id"]
      else
        conn |> get_req_header("organization") |> List.first()
      end
    if organization_id do
      if current_user.super do
        organization = Organizations.get_organization!(organization_id)
        membership = %Membership{ role: "admin" }
        conn
        |> assign(:current_organization, organization)
        |> assign(:current_membership, membership)
      else
        case Organizations.get_organization(current_user, organization_id) do
          %Organization{} = current_organization ->
            current_membership = Organizations.get_membership!(current_user, current_organization)
            conn
            |> assign(:current_organization, current_organization)
            |> assign(:current_membership, current_membership)
          _ ->
            conn
            |> send_resp(
              :forbidden,
              Poison.encode!(%{
                type: "forbidden_organization",
                errors: ["You don't have access to this organization"]
              })
            )
            |> halt()
        end
      end
    else
      conn
    end
  end
end
