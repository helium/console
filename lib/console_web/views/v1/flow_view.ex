defmodule ConsoleWeb.V1.FlowView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.FlowView

  def render("index.json", %{flows: flows}) do
    render_many(flows, FlowView, "flow.json")
  end

  def render("flow.json", %{flow: flow}) do
    %{
      id: flow.id,
      device_id: flow.device_id,
      function_id: flow.function_id,
      label_id: flow.label_id,
      integration_id: flow.channel_id,
      organization_id: flow.organization_id
    }
  end
end
