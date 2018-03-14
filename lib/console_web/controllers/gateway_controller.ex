defmodule ConsoleWeb.GatewayController do
  use ConsoleWeb, :controller

  alias Console.Gateways
  alias Console.Gateways.Gateway

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    gateways = Gateways.list_gateways()
    render(conn, "index.json", gateways: gateways)
  end

  def create(conn, %{"gateway" => gateway_params}) do
    with {:ok, %Gateway{} = gateway} <- Gateways.create_gateway(gateway_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", gateway_path(conn, :show, gateway))
      |> render("show.json", gateway: gateway)
    end
  end

  def show(conn, %{"id" => id}) do
    gateway = Gateways.get_gateway!(id)
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
