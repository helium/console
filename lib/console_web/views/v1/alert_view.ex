defmodule ConsoleWeb.V1.AlertView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.AlertView

  def render("show.json", %{alert: alert}) do
    render_one(alert, AlertView, "alert.json")
  end

  def render("alert.json", %{alert: alert}) do
    %{
      id: alert.id,
      name: alert.name,
      organization_id: alert.organization_id,
      config: alert.config,
      last_triggered_at: alert.last_triggered_at
    }
  end
end
