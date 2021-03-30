defmodule ConsoleWeb.Plug.PutCurrentOrganization do
  alias Console.Organizations

  import Plug.Conn, only: [assign: 3, send_resp: 3, halt: 1, get_req_header: 2]

  def init(default), do: default

  def call(conn, _default) do
    current_user = conn.assigns.current_user
    organization_id = if conn.params["organization_id"] do
        # used for GraphqlPipeline
        conn.params["organization_id"]
      else
        # used for AuthApiPipeline
        conn |> get_req_header("organization") |> List.first()
      end
    if organization_id do
      case Organizations.get_current_organization(current_user, organization_id) do
        %{membership: membership, organization: organization} ->
          conn
          |> assign(:current_organization, organization)
          |> assign(:current_membership, membership)
        :forbidden ->
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
    else
      conn
    end
  end
end
