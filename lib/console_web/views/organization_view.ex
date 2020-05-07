defmodule ConsoleWeb.OrganizationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.OrganizationView

  def render("index.json", %{organizations: organizations}) do
    render_many(organizations, OrganizationView, "organization.json")
  end

  def render("show.json", %{organization: organization}) do
    render_one(organization, OrganizationView, "organization.json")
  end

  def render("switch.json", %{jwt: jwt}) do
    %{
      jwt: jwt
    }
  end

  def render("organization.json", %{organization: organization}) do
    %{
      id: organization.id,
      name: organization.name,
      role: organization.role
    }
  end

  def append_organization(json, organization) do
    Map.put(json, :organization, render_one(organization, OrganizationView, "organization.json"))
  end
end
