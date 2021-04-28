defmodule ConsoleWeb.MultiBuyView do
  use ConsoleWeb, :view
  alias ConsoleWeb.MultiBuyView

  def render("show.json", %{multi_buy: multi_buy}) do
    render_one(multi_buy, MultiBuyView, "multi_buy.json")
  end

  def render("multi_buy.json", %{multi_buy: multi_buy}) do
    %{
      id: multi_buy.id,
      name: multi_buy.name,
      organization_id: multi_buy.organization_id,
      value: multi_buy.value
    }
  end
end
