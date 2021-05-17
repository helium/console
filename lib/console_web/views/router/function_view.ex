defmodule ConsoleWeb.Router.FunctionView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.FunctionView

  def render("index.json", %{functions: functions}) do
    render_many(functions, FunctionView, "function.json")
  end

  def render("show.json", %{function: function}) do
    render_one(function, FunctionView, "function.json")
  end

  def render("function.json", %{function: function}) do
    %{
      id: function.id,
      name: function.name,
      type: function.type,
      format: function.format,
      body: function.body,
      active: function.active,
    }
  end

  def append_function(json, function) do
    function_json = render_one(function, FunctionView, "show.json")
    Map.put(json, :function, function_json)
  end
end
