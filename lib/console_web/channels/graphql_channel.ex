defmodule ConsoleWeb.GraphqlChannel do
  use Phoenix.Channel

  def join("graphql:topbar_orgs", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:mobile_topbar_orgs", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:orgs_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:invitations_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:members_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:api_keys", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:dc_index", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:dc_purchases_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:function_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:function_index_bar", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:function_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:channels_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:channel_index_bar", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:channel_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:device_index_labels_bar", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:label_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:label_show_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:label_show_debug", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:devices_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:devices_header_count", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:device_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:device_show_labels_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:events_dashboard", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:device_show_debug", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:device_import_update", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:device_show_downlink", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:label_show_downlink", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:flows_update", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:devices_in_labels_update", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:flows_nodes_menu", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:resources_update", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:alerts_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:alert_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:alert_settings_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:packet_configs_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:packet_config_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:xor_filter_update", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:coverage_index_org_hotspots", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:coverage_hotspot_show_debug", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:config_profiles_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:config_profile_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:followed_hotspot_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:groups_index", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:followed_hotspots_groups", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:mobile_device_labels", _message, socket) do
    {:ok, socket}
  end
end
