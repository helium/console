defmodule ConsoleWeb.Router.GatewayView do
  use ConsoleWeb, :view

  def render("gateway_register.json", %{tx: tx, signature: signature}) do
    %{
      tx: tx,
      signature: signature
    }
  end
end
