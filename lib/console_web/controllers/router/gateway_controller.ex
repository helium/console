defmodule ConsoleWeb.Router.GatewayController do
  use ConsoleWeb, :controller

  alias Console.Gateways
  alias Console.HardwareIdentifiers.HardwareIdentifier
  alias Console.HardwareIdentifiers

  action_fallback ConsoleWeb.FallbackController

  def register(conn, %{"OUI" => oui, "nonce" => nonce, "gateway" => %{"id" => token, "public_key" => public_key, "payee_address" => payee_address}}) do
    with %HardwareIdentifier{gateway: gateway} <- HardwareIdentifiers.get_resource_by_hardware_identifier(token, :gateway), # need to verify OUI and nonce
      nil <- gateway.public_key,
      {:ok, _} <- Gateways.update_gateway(gateway, %{public_key: public_key}) do

        render(conn, "gateway_register.json", %{tx: "some transaction", signature: "some signature"}) # need to generate tx and sig
    else _ ->
      {:error, :not_found}
    end
  end

  def verify(conn, %{"OUI" => oui, "gateway" => %{"id" => token}}) do
    with %HardwareIdentifier{gateway: gateway} <- HardwareIdentifiers.get_resource_by_hardware_identifier(token, :gateway), # need to verify OUI
      "pending" <- gateway.status,
      {:ok, _} <- Gateways.update_gateway(gateway, %{status: "verified"}) do

        conn
        |> send_resp(:no_content, "")
    else _ ->
      {:error, :not_found}
    end
  end
end
