defmodule ConsoleWeb.V1.OrganizationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.OrganizationView

  def render("show.json", %{organization: organization}) do
    render_one(organization, OrganizationView, "organization.json")
  end

  def render("organization.json", %{organization: organization}) do
    %{
      id: organization.id,
      name: organization.name,
      dc_balance: organization.dc_balance
    }
  end
end
