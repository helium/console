defmodule ConsoleWeb.ConfigProfileView do
  use ConsoleWeb, :view
  alias ConsoleWeb.ConfigProfileView

  def render("show.json", %{config_profile: config_profile}) do
    render_one(config_profile, ConfigProfileView, "config_profile.json")
  end

  def render("config_profile.json", %{config_profile: config_profile}) do
    %{
      id: config_profile.id,
      name: config_profile.name,
      organization_id: config_profile.organization_id,
      adr_allowed: config_profile.adr_allowed,
      cf_list_enabled: config_profile.cf_list_enabled
    }
  end
end
