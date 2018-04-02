defmodule ConsoleWeb.GatewayController do
  use ConsoleWeb, :controller

  alias Console.Gateways
  alias Console.Gateways.Gateway

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_team = Console.Teams.fetch_assoc(conn.assigns.current_team)
    render(conn, "index.json", gateways: current_team.gateways)
  end

  def create(conn, %{"gateway" => gateway_params}) do
    current_team = conn.assigns.current_team
    gateway_params = Map.merge(gateway_params, %{"team_id" => current_team.id})
    with {:ok, %Gateway{} = gateway} <- Gateways.create_gateway(gateway_params) do
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
    gateway = Gateways.get_gateway!(id)

    with {:ok, %Gateway{} = gateway} <- Gateways.update_gateway(gateway, gateway_params) do
      render(conn, "show.json", gateway: gateway)
    end
  end

  def delete(conn, %{"id" => id}) do
    gateway = Gateways.get_gateway!(id)
    with {:ok, %Gateway{}} <- Gateways.delete_gateway(gateway) do
      send_resp(conn, :no_content, "")
    end
  end
end
