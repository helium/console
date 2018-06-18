defmodule ConsoleWeb.GatewayController do
  use ConsoleWeb, :controller

  alias Console.Gateways
  alias Console.Gateways.Gateway
  alias Console.AuditTrails

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_team = conn.assigns.current_team
                   |> Console.Teams.fetch_assoc([:gateways])
    render(conn, "index.json", gateways: current_team.gateways)
  end

  def create(conn, %{"gateway" => gateway_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    gateway_params = Map.merge(gateway_params, %{"team_id" => current_team.id})
    with {:ok, %Gateway{} = gateway} <- Gateways.create_gateway(gateway_params) do
      broadcast(gateway, "new")
      AuditTrails.create_audit_trail("gateway", "create", current_user, current_team, "gateways", gateway)

      conn
      |> put_status(:created)
      |> put_resp_header("location", gateway_path(conn, :show, gateway))
      |> render("show.json", gateway: gateway)
    end
  end

  def show(conn, %{"id" => id}) do
    gateway = Gateways.get_gateway!(id) |> Gateways.fetch_assoc()
    render(conn, "show.json", gateway: gateway)
  end

  def update(conn, %{"id" => id, "gateway" => gateway_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    gateway = Gateways.get_gateway!(id)

    with {:ok, %Gateway{} = gateway} <- Gateways.update_gateway(gateway, gateway_params) do
      AuditTrails.create_audit_trail("gateway", "update", current_user, current_team, "gateways", gateway)

      render(conn, "show.json", gateway: gateway)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    gateway = Gateways.get_gateway!(id)
    with {:ok, %Gateway{} = gateway} <- Gateways.delete_gateway(gateway) do
      broadcast(gateway, "delete")
      AuditTrails.create_audit_trail("gateway", "delete", current_user, current_team, "gateways", gateway)

      conn
      |> put_resp_header("message", "#{gateway.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def register(conn, %{"OUI" => oui, "nonce" => nonce, "gateway" => %{"id" => id, "public_key" => public_key, "payee_address" => payee_address}}) do
    # receive the following from router:
    #   nonce and OUI self explanatory
    #   gateway["id"] is 32 bit gateway ID
    #   gateway["public_key"] is the gateway public key router passes to console
    #   gateway["payee_address"] is the team b58b58_address
    #
    # First check the following is valid:
    #   nonce verification is valid and not messed with
    #   OUI matches console's oui
    #
    # Then update gateway's public key
    #
    # If nonce and OUI verification fails, send back error status 404
    # If verification succeeds, send back countersigned data
  end

  def verify(conn, %{"OUI" => oui, "gateway" => %{"id" => id}}) do
    # receive the following from router:
    #   OUI self explanatory
    #   gateway["id"] is 32 bit gateway ID
    #
    # Update gateway's status to verified
    #
    # If gateway cannot be found with id send back error status 404
    # If gateway status changed, send back 202
  end

  defp broadcast(%Gateway{} = gateway, _) do
    gateway = Gateways.fetch_assoc(gateway, [:team])

    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, gateway, gateway_added: "#{gateway.team.id}/gateway_added")
  end
end
