defmodule ConsoleWeb.Router.OrganizationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.OrganizationView

  def render("index.json", %{organizations: organizations}) do
    render_many(organizations, OrganizationView, "organization.json")
  end

  def render("show.json", %{organization: organization}) do
    render_one(organization, OrganizationView, "organization.json")
  end

  def render("organization.json", %{organization: organization}) do
    %{
      id: organization.id,
      name: organization.name,
      dc_balance: organization.dc_balance,
      dc_balance_nonce: organization.dc_balance_nonce
    }
  end
end
