defmodule ConsoleWeb.ConfigProfileController do
  use ConsoleWeb, :controller

  alias Console.ConfigProfiles
  alias Console.ConfigProfiles.ConfigProfile

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"config_profile" => config_profile_params}) do
    current_organization = conn.assigns.current_organization
    config_profile_params =
      Map.merge(config_profile_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %ConfigProfile{} = config_profile} <- ConfigProfiles.create_config_profile(config_profile_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:config_profiles_index_table", "graphql:config_profiles_index_table:#{current_organization.id}:config_profile_list_update", %{})

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Config Profile #{config_profile.name} added successfully")
      |> render("show.json", config_profile: config_profile)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    config_profile = ConfigProfiles.get_config_profile!(current_organization, id)

    affected_device_ids = ConfigProfiles.get_all_config_profile_associated_device_ids(id)

    with {:ok, %ConfigProfile{} = config_profile} <- ConfigProfiles.delete_config_profile(config_profile) do
      ConsoleWeb.Endpoint.broadcast("graphql:config_profiles_index_table", "graphql:config_profiles_index_table:#{current_organization.id}:config_profile_list_update", %{})
      broadcast_router_update_devices(affected_device_ids)

      conn
      |> put_resp_header("message", "Config Profile #{config_profile.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def update(conn, %{"id" => id, "config_profile" => config_profile_params}) do
    current_organization = conn.assigns.current_organization
    config_profile = ConfigProfiles.get_config_profile!(current_organization, id)
    name = config_profile.name

    affected_device_ids = ConfigProfiles.get_all_config_profile_associated_device_ids(id)

    with {:ok, %ConfigProfile{} = config_profile} <- ConfigProfiles.update_config_profile(config_profile, config_profile_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:config_profile_show", "graphql:config_profile_show:#{config_profile.id}:config_profile_update", %{})
      broadcast_router_update_devices(affected_device_ids)

      msg =
        cond do
          config_profile.name == name -> "Config profile updated successfully"
          true -> "Config Profile #{name} was successfully updated to #{config_profile.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", config_profile: config_profile)
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end