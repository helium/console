defmodule ConsoleWeb.ApiKeyView do
  use ConsoleWeb, :view

  def render("show.json", %{api_key: api_key, key: key}) do
    %{
      id: api_key.id,
      name: api_key.name,
      role: api_key.role,
      user_id: api_key.user_id,
      organization_id: api_key.organization_id,
      key: key
    }
  end
end
