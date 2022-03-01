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
    function_attrs = %{
      id: function.id,
      name: function.name,
      body: function.body,
      type: function.type,
      format: function.format,
      active: function.active
    }
  end
end
