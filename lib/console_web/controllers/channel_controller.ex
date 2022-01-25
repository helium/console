defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Organizations
  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.Functions
  alias Console.Alerts
  alias Console.AlertEvents
  alias Console.Flows

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  # For create adafruit / google sheets channel
  def create(conn, %{"channel" => channel_params, "func" => function_params }) do
    current_organization = conn.assigns.current_organization
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.run(:channel, fn _repo, _ ->
        Channels.create_channel(current_organization, channel_params)
      end)
      |> Ecto.Multi.run(:function, fn _repo, %{ channel: _channel } ->
        case function_params["format"] do
           "custom" ->
            function = Functions.get_function!(current_organization, function_params["id"])
            {:ok, function}
          "cayenne" ->
            function_params = Map.merge(function_params, %{"name" => channel_params["name"], "type" => "decoder", "organization_id" => current_organization.id })
            Functions.create_function(function_params, current_organization)
          "googlesheet" ->
            function_params = Map.merge(function_params, %{"name" => channel_params["name"], "type" => "decoder", "organization_id" => current_organization.id, "format" => "custom" })
            Functions.create_function(function_params, current_organization)
        end
      end)
      |> Ecto.Multi.run(:flow, fn _repo, %{ channel: channel, function: function } ->
        new_edge = %{
          "source" => "function-" <> function.id,
          "target" => "channel-" <> channel.id
        }

        edges =
          case Map.get(current_organization.flow, "edges") do
            nil -> [new_edge]
            edges -> [new_edge | edges]
          end

        updated_flow =
          current_organization.flow
          |> Map.put("channel-" <> channel.id, %{ "position" => %{"x" => 300, "y" => 50} })
          |> Map.put("function-" <> function.id, %{ "position" => %{"x" => 50, "y" => 50} })
          |> Map.put("edges", edges)

        Organizations.update_organization(current_organization, %{ "flow" => updated_flow })
      end)
      |> Repo.transaction()

      case result do
        {:error, _, changeset, _} -> {:error, changeset}
        {:ok, %{ channel: channel, function: _function}} ->
          ConsoleWeb.Endpoint.broadcast("graphql:channel_index_bar", "graphql:channel_index_bar:#{current_organization.id}:channel_list_update", %{})

          conn
          |> put_status(:created)
          |> render("show.json", channel: channel)
        _ -> result
      end
  end

  def create(conn, %{"channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:channel_index_bar", "graphql:channel_index_bar:#{current_organization.id}:channel_list_update", %{})

      conn
      |> put_status(:created)
      |> render("show.json", channel: channel)
    end
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    affected_flows = Flows.get_flows_with_channel_id(current_organization.id, channel.id)
    all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)

    # get channel info before updating
    updated_channel = case length(all_device_ids) do
      0 -> nil
      _ -> %{ channel_id: id, channel_name: channel.name }
    end

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, channel_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:channel_show", "graphql:channel_show:#{channel.id}:channel_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:resources_update", "graphql:resources_update:#{current_organization.id}:organization_resources_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:channel_index_bar", "graphql:channel_index_bar:#{current_organization.id}:channel_list_update", %{})

      broadcast_router_update_devices(all_device_ids)

      if updated_channel != nil do
        { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
        details = %{
          channel_name: updated_channel.channel_name,
          updated_by: conn.assigns.current_user.email,
          time: time
        }
        AlertEvents.notify_alert_event(channel.id, "integration", "integration_with_devices_updated", details)
      end

      conn
      |> put_resp_header("message", "Integration #{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    affected_flows = Flows.get_flows_with_channel_id(current_organization.id, channel.id)
    all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)

    # get channel info before deleting
    deleted_channel = case length(all_device_ids) do
      0 -> nil
      _ -> %{ channel_id: id, channel_name: Channels.get_channel!(id).name }
    end

    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      ConsoleWeb.Endpoint.broadcast("graphql:channels_index_table", "graphql:channels_index_table:#{current_organization.id}:channel_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:channel_index_bar", "graphql:channel_index_bar:#{current_organization.id}:channel_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})

      if (deleted_channel != nil) do
        { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
        details = %{
          channel_name: deleted_channel.channel_name,
          deleted_by: conn.assigns.current_user.email,
          time: time
        }
        AlertEvents.delete_unsent_alert_events_for_integration(id)
        AlertEvents.notify_alert_event(deleted_channel.channel_id, "integration", "integration_with_devices_deleted", details)
        Alerts.delete_alert_nodes(id, "integration")
      end

      broadcast_router_update_devices(all_device_ids)

      conn
      |> put_resp_header("message", "The Integration #{channel.name} has been deleted")
      |> render("show.json", channel: channel)
    end
  end

  def get_ubidots_url(conn, %{"token" => token, "name" => name}) do
    headers = [{"Content-Type", "application/json"}, {"x-auth-token", token}]
    body = Jason.encode!(%{
      name: name,
      description: "Plugin created using Ubidots APIv2",
      settings: %{
        device_type_name: "Helium",
        helium_labels_as: "tags",
        token: token
      }
    })
    response = HTTPoison.post "https://industrial.api.ubidots.com/api/v2.0/plugin_types/~helium/plugins/", body, headers
    case response do
      {:ok, %{ status_code: 201, body: body }} ->
        conn
        |> put_resp_header("message", "Received Ubidots plugin webhook URL successfully")
        |> send_resp(:ok, body)
      _ ->
        errors = %{ "errors" => %{ "error" => "Failed to create Ubidots plugin with provided token" }}

        conn
        |> send_resp(502, Jason.encode!(errors))
    end
  end

  def get_google_form_data(conn, %{"formId" => id }) do

    response = HTTPoison.get("https://docs.google.com/forms/d/e/#{id}/viewform")
    case response do
      {:ok, %{ status_code: 200, body: body }} ->
        conn
        |> put_resp_header("message", "Received Google Form data successfully")
        |> send_resp(:ok, body)
      _ ->
        errors = %{ "errors" => %{ "error" => "Failed to get Google Form data with provided ID" }}

        conn
        |> send_resp(502, Jason.encode!(errors))
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
