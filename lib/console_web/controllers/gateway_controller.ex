defmodule ConsoleWeb.GatewayController do
  use ConsoleWeb, :controller

  alias Console.Gateways
  alias Console.Gateways.Gateway
  alias Console.Gateways.GatewayIdentifier
  alias Console.AuditTrails

  plug ConsoleWeb.Plug.AuthorizeAction when action not in [:register, :verify]

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
    with {:ok, %GatewayIdentifier{}} <- Gateways.delete_gateway(gateway) do
      broadcast(gateway, "delete")
      AuditTrails.create_audit_trail("gateway", "delete", current_user, current_team, "gateways", gateway)

      conn
      |> put_resp_header("message", "#{gateway.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def register(conn, %{"OUI" => oui, "nonce" => nonce, "gateway" => %{"id" => gateway_id, "public_key" => public_key, "payee_address" => payee_address}}) do
    with %GatewayIdentifier{gateway: gateway} <- Gateways.get_gateway_by_unique_identifier(gateway_id), # need to verify OUI and nonce
      nil <- gateway.public_key,
      {:ok, _} <- Gateways.update_gateway(gateway, %{public_key: public_key}) do

        render(conn, "gateway_register.json", %{tx: "some transaction", signature: "some signature"}) # need to generate tx and sig
    else _ ->
      {:error, :not_found}
    end
  end

  def verify(conn, %{"OUI" => oui, "gateway" => %{"id" => gateway_id}}) do
    with %GatewayIdentifier{gateway: gateway} <- Gateways.get_gateway_by_unique_identifier(gateway_id), # need to verify OUI
      "pending" <- gateway.status,
      {:ok, _} <- Gateways.update_gateway(gateway, %{status: "verified"}) do

        conn
        |> send_resp(:no_content, "")
    else _ ->
      {:error, :not_found}
    end
  end

  defp broadcast(%Gateway{} = gateway, _) do
    gateway = Gateways.fetch_assoc(gateway, [:team])

    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, gateway, gateway_added: "#{gateway.team.id}/gateway_added")
  end
end
