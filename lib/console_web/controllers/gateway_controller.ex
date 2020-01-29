defmodule ConsoleWeb.GatewayController do
  use ConsoleWeb, :controller

  alias Console.Gateways
  alias Console.Gateways.Gateway

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_team = conn.assigns.current_team
                   |> Console.Organizations.fetch_assoc([:gateways])
    render(conn, "index.json", gateways: current_team.gateways)
  end

  def create(conn, %{"gateway" => gateway_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    gateway_params =
      Map.merge(gateway_params, %{"team_id" => current_team.id})
      |> Map.new(fn {k, v} -> {String.to_atom(k), v} end)

    with {:ok, %Gateway{} = gateway} <- Gateways.create_gateway(gateway_params) do
      broadcast(gateway, "new")

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

      render(conn, "show.json", gateway: gateway)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    gateway = Gateways.get_gateway!(id)
    with {:ok, %Gateway{} = gateway} <- Gateways.delete_gateway(gateway) do
      broadcast(gateway, "delete")

      conn
      |> put_resp_header("message", "#{gateway.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  defp broadcast(%Gateway{} = gateway, _) do
    gateway = Gateways.fetch_assoc(gateway, [:team])

    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, gateway, gateway_added: "#{gateway.team.id}/gateway_added")
  end
end
