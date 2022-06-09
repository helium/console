defmodule ConsoleWeb.V1.FunctionView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.FunctionView

  def render("index.json", %{functions: functions}) do
    render_many(functions, FunctionView, "function.json")
  end

  def render("show.json", %{function: function}) do
    render_one(function, FunctionView, "function.json")
  end

  def render("function.json", %{function: function}) do
    if Map.has_key?(function, :deactivated_by_console_host) do
      %{
        id: function.id,
        name: function.name,
        body: function.body,
        type: function.type,
        format: function.format,
        active: function.active,
        deactivated_by_console_host: function.deactivated_by_console_host
      }
    else
      %{
        id: function.id,
        name: function.name,
        body: function.body,
        type: function.type,
        format: function.format,
        active: function.active
      }
    end

  end
end
