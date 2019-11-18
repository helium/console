defmodule ConsoleWeb.StatsView do
  use ConsoleWeb, :view

  def render("show.json", %{ stats: stats }) do
    stats
  end
end
