defmodule ConsoleWeb.Router.OrganizationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.OrganizationView

  def render("show.json", %{organization: organization}) do
    render_one(organization, OrganizationView, "organization.json")
  end

  def render("organization.json", %{organization: organization}) do
    %{
      id: organization.id,
      dc_balance: organization.dc_balance,
      dc_balance_nonce: organization.dc_balance_nonce
    }
  end
end
