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
    case Map.get(organization, :app_eui) do
      nil ->
        %{
          id: organization.id,
          name: organization.name,
          role: organization.role,
        }
      _ ->
        %{
          id: organization.id,
          name: organization.name,
          role: organization.role,
          app_eui: organization.app_eui
        }
    end
  end
end
