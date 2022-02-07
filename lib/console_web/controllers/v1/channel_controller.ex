defmodule ConsoleWeb.V1.ChannelController do
  use ConsoleWeb, :controller
  import Ecto.Query, warn: false

  alias Console.Organizations
  alias Console.Flows
  alias Console.Devices
  alias Console.Labels
  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.Alerts
  alias Console.AlertEvents
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, %{ "name" => name }) do
    current_organization = conn.assigns.current_organization

    case Channels.get_channel_by_name(current_organization, name) do
      nil ->
        {:error, :not_found, "Integration not found"}
      %Channel{} = channel ->
        channel = attach_devices_and_labels(current_organization, channel)

        render(conn, "show.json", channel: channel)
    end
  end

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:channels])

    channels = Enum.map(current_organization.channels, fn c -> attach_devices_and_labels(current_organization, c) end)

    render(conn, "index.json", channels: channels)
  end

  def show(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Channels.get_channel(current_organization, id) do
      nil ->
        {:error, :not_found, "Integration not found"}
      %Channel{} = channel ->
        channel = attach_devices_and_labels(current_organization, channel)

        render(conn, "show.json", channel: channel)
    end
  end

  def create_prebuilt(conn, %{ "name" => name, "token" => token, "type" => type}) do
    current_organization = conn.assigns.current_organization

    channel_params =
      case type do
        "akenza" ->
          %{
            "credentials" => %{
              "endpoint" => "https://data-gateway.akenza.io/v3/capture?secret=#{token}",
              "headers" => %{},
              "method" => "post"
            },
            "name" => name,
            "type" => "http",
            "organization_id" => current_organization.id
          }
        "ubidots" ->
          headers = [{"Content-Type", "application/json"}, {"x-auth-token", token}]
          body = Jason.encode!(%{
            name: "Helium Integration",
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
              parsed_body = Jason.decode!(body)
              %{
                "credentials" => %{
                  "endpoint" => parsed_body["webhookUrl"],
                  "headers" => %{},
                  "method" => "post"
                },
                "name" => name,
                "type" => "http",
                "organization_id" => current_organization.id
              }
            _ ->
              %{ "error" => "Failed to create Ubidots plugin with provided token" }
          end
        "tago" ->
          %{
            "credentials" => %{
              "endpoint" => "https://helium.middleware.tago.io/uplink",
              "headers" => %{"Authorization" => token},
              "method" => "post"
            },
            "name" => name,
            "type" => "http",
            "organization_id" => current_organization.id
          }
        "datacake" ->
          %{
            "credentials" => %{
              "endpoint" => "https://api.datacake.co/integrations/lorawan/helium/",
              "headers" => %{"Key" => "Authentication", "Value" => "Token #{token}"},
              "method" => "post"
            },
            "name" => name,
            "type" => "http",
            "organization_id" => current_organization.id
          }
        _ -> nil
      end

    case channel_params do
      nil ->
        {:error, :bad_request, "Cannot create integration type: #{type}" }
      %{ "error" => error } ->
        {:error, :bad_gateway, error }
      _ ->
        with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
          channel = attach_devices_and_labels(current_organization, channel)

          conn
          |> put_status(:created)
          |> render("show.json", channel: channel)
        end
    end
  end

  def delete(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Channels.get_channel(current_organization, id) do
      nil ->
        {:error, :not_found, "Integration not found"}
      %Channel{} = channel ->
        affected_flows = Flows.get_flows_with_channel_id(current_organization.id, channel.id)
        all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)

        # get channel info before deleting
        deleted_channel = case length(all_device_ids) do
          0 -> nil
          _ -> %{ channel_id: channel.id, channel_name: channel.name }
        end

        with {:ok, _} <- Channels.delete_channel(channel) do
          if (deleted_channel != nil) do
            { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
            details = %{
              channel_name: deleted_channel.channel_name,
              deleted_by: "v1 API",
              time: time
            }
            AlertEvents.delete_unsent_alert_events_for_integration(channel.id)
            AlertEvents.notify_alert_event(deleted_channel.channel_id, "integration", "integration_with_devices_deleted", details)
            Alerts.delete_alert_nodes(channel.id, "integration")

            broadcast_router_update_devices(all_device_ids)
          end

          conn
          |> put_status(:ok)
          |> render("show.json", channel: channel)
        end
    end
  end

  defp attach_devices_and_labels(organization, channel) do
    flows = Flows.get_flows_with_channel_id(organization.id, channel.id)

    linked_devices = Enum.reduce(flows, [], fn flow, acc ->
      if flow.device_id != nil do
        [flow.device_id | acc]
      else
        acc
      end
    end)
    |> Devices.get_devices_in_list()

    linked_labels = Enum.reduce(flows, [], fn flow, acc ->
      if flow.label_id != nil do
        [flow.label_id | acc]
      else
        acc
      end
    end)
    |> Labels.get_labels_in_list()

    channel
    |> Map.put(:devices, linked_devices)
    |> Map.put(:labels, linked_labels)
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
