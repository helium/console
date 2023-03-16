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
  alias Console.AuditActions
  alias Console.CommunityChannels

  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, %{ "name" => name }) do
    current_organization = conn.assigns.current_organization

    case Channels.get_channel_by_name(current_organization, name) do
      nil ->
        {:error, :not_found, "Integration not found"}
      %Channel{} = channel ->
        channel =
          attach_devices_and_labels(current_organization, channel)
          |> CommunityChannels.inject_credentials(false)
          |> check_allowed_channel()

        render(conn, "show.json", channel: channel)
    end
  end

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:channels])

    channels =
      Enum.map(current_organization.channels, fn c ->
        attach_devices_and_labels(current_organization, c)
        |> CommunityChannels.inject_credentials(false)
      end)
      |> Enum.map(fn c ->
        check_allowed_channel(c)
      end)

    render(conn, "index.json", channels: channels)
  end

  def show(conn, %{ "id" => id }) do
    with {:ok, _id} <- Ecto.UUID.dump(id) do
      current_organization = conn.assigns.current_organization

      case Channels.get_channel(current_organization, id) do
        nil ->
          {:error, :not_found, "Integration not found"}
        %Channel{} = channel ->
          channel =
            attach_devices_and_labels(current_organization, channel)
            |> CommunityChannels.inject_credentials(false)
            |> check_allowed_channel()

          render(conn, "show.json", channel: channel)
      end
    else
      :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
    end
  end

  def create_community_channel(conn, %{ "name" => name, "token" => token, "type" => type} = attrs) do
    current_organization = conn.assigns.current_organization
    allowed_types = Channel.get_allowed_integration_types()

    if type in allowed_types do
      channel_params =
        case type do
          "blockbax" ->
            %{
              "name" => name,
              "type" => type,
              "organization_id" => current_organization.id,
              "credentials" => %{
                "token" => token,
              }
            }
          "akenza" ->
            %{
              "credentials" => %{
                "secret" => token,
              },
              "name" => name,
              "type" => type,
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
                    "webhook_token" => String.split(parsed_body["webhookUrl"], "/api/web-hook/") |> Enum.at(1),
                  },
                  "name" => name,
                  "type" => type,
                  "organization_id" => current_organization.id
                }
              _ ->
                %{ "error" => "Failed to create Ubidots plugin with provided token" }
            end
          "tago" ->
            %{
              "credentials" => %{
                "token" => token,
              },
              "name" => name,
              "type" => type,
              "organization_id" => current_organization.id
            }
          "datacake" ->
            %{
              "credentials" => %{
                "token" => token,
              },
              "name" => name,
              "type" => type,
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
            channel =
              channel
              |> Map.put(:devices, [])
              |> Map.put(:labels, [])
              |> CommunityChannels.inject_credentials(false)

            AuditActions.create_audit_action(
              current_organization.id,
              "v1_api",
              "channel_controller_create",
              channel.id,
              attrs
            )

            conn
            |> put_status(:created)
            |> render("show.json", channel: channel)
          end
      end
    else
      {:error, :bad_request, "This integration type is not allowed on this Console" }
    end
  end

  def create(conn, %{ "name" => name, "type" => "aws", "topic" => topic, "aws_access_key" => pk, "aws_secret_key" => sk, "aws_region" => region } = attrs) do
    current_organization = conn.assigns.current_organization
    allowed_types = Channel.get_allowed_integration_types()

    if "aws" in allowed_types do
      channel_params =
        %{
          "credentials" => %{
            "topic" => topic,
            "aws_access_key" => pk,
            "aws_secret_key" => sk,
            "aws_region" => region
          },
          "name" => name,
          "type" => "aws",
          "organization_id" => current_organization.id
        }

      with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
        channel =
          channel
          |> Map.put(:devices, [])
          |> Map.put(:labels, [])

        AuditActions.create_audit_action(
          current_organization.id,
          "v1_api",
          "channel_controller_create",
          channel.id,
          attrs
        )

        conn
        |> put_status(:created)
        |> render("show.json", channel: channel)
      end
    else
      {:error, :bad_request, "This integration type is not allowed on this Console" }
    end
  end

  def create(conn, %{ "name" => name, "type" => "azure", "azure_policy_name" => policy_name, "azure_hub_name" => hub_name, "azure_primary_key" => key } = attrs) do
    current_organization = conn.assigns.current_organization
    allowed_types = Channel.get_allowed_integration_types()

    if "azure" in allowed_types do
      channel_params =
        %{
          "credentials" => %{
            "azure_policy_name" => policy_name,
            "azure_hub_name" => hub_name,
            "azure_policy_key" => key
          },
          "name" => name,
          "type" => "azure",
          "organization_id" => current_organization.id
        }

      with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
        channel =
          channel
          |> Map.put(:devices, [])
          |> Map.put(:labels, [])

        AuditActions.create_audit_action(
          current_organization.id,
          "v1_api",
          "channel_controller_create",
          channel.id,
          attrs
        )

        conn
        |> put_status(:created)
        |> render("show.json", channel: channel)
      end
    else
      {:error, :bad_request, "This integration type is not allowed on this Console" }
    end
  end

  def create(conn, %{ "name" => name, "type" => "iot_central", "iot_central_api_key" => api_key, "iot_central_scope_id" => scope_id, "iot_central_app_name" => app_name } = attrs) do
    current_organization = conn.assigns.current_organization
    allowed_types = Channel.get_allowed_integration_types()

    if "iot_central" in allowed_types do
      channel_params =
        %{
          "credentials" => %{
            "iot_central_api_key" => api_key,
            "iot_central_scope_id" => scope_id,
            "iot_central_app_name" => app_name
          },
          "name" => name,
          "type" => "iot_central",
          "organization_id" => current_organization.id
        }

      with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
        channel =
          channel
          |> Map.put(:devices, [])
          |> Map.put(:labels, [])

        AuditActions.create_audit_action(
          current_organization.id,
          "v1_api",
          "channel_controller_create",
          channel.id,
          attrs
        )

        conn
        |> put_status(:created)
        |> render("show.json", channel: channel)
      end
    else
      {:error, :bad_request, "This integration type is not allowed on this Console" }
    end
  end

  def create(conn, %{ "name" => name, "type" => "mqtt", "endpoint" => endpoint, "uplink_topic" => uplink_topic, "downlink_topic" => downlink_topic } = attrs) do
    current_organization = conn.assigns.current_organization
    allowed_types = Channel.get_allowed_integration_types()

    if "mqtt" in allowed_types do
      channel_params =
        %{
          "credentials" => %{
            "endpoint" => endpoint,
            "uplink" => %{
              "topic" => uplink_topic
            },
            "downlink" => %{
              "topic" => downlink_topic
            },
          },
          "name" => name,
          "type" => "mqtt",
          "organization_id" => current_organization.id
        }

      with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
        channel =
          channel
          |> Map.put(:devices, [])
          |> Map.put(:labels, [])

        AuditActions.create_audit_action(
          current_organization.id,
          "v1_api",
          "channel_controller_create",
          channel.id,
          attrs
        )

        conn
        |> put_status(:created)
        |> render("show.json", channel: channel)
      end
    else
      {:error, :bad_request, "This integration type is not allowed on this Console" }
    end
  end

  def create(conn, %{ "name" => name, "type" => "http", "endpoint" => endpoint, "method" => method } = attrs) do
    current_organization = conn.assigns.current_organization
    allowed_types = Channel.get_allowed_integration_types()

    if "http" in allowed_types do
      credentials =
        %{ "endpoint" => endpoint, "method" => method }
        |> Map.merge(Map.take(attrs, ["headers", "url_params"]))

      if validate_http_headers(credentials["headers"]) and validate_http_url_params(credentials["url_params"]) do
        channel_params =
          %{
            "credentials" => credentials,
            "name" => name,
            "type" => "http",
            "organization_id" => current_organization.id
          }

        with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
          channel =
            channel
            |> Map.put(:devices, [])
            |> Map.put(:labels, [])

          AuditActions.create_audit_action(
            current_organization.id,
            "v1_api",
            "channel_controller_create",
            channel.id,
            attrs
          )

          conn
          |> put_status(:created)
          |> render("show.json", channel: channel)
        end
      else
        if not validate_http_headers(credentials["headers"]) do
          {:error, :bad_request, "Integration headers must be in a format of a valid map"}
        else
          {:error, :bad_request, "Integration template params must use {{ or {{{ and must be closed properly"}
        end
      end
    else
      {:error, :bad_request, "This integration type is not allowed on this Console" }
    end
  end

  def delete(conn, %{ "id" => id } = attrs) do
    with {:ok, _id} <- Ecto.UUID.dump(id) do
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

            AuditActions.create_audit_action(
              current_organization.id,
              "v1_api",
              "channel_controller_delete",
              channel.id,
              attrs
            )

            conn
            |> put_status(:ok)
            |> render("show.json", channel: channel)
          end
      end
    else
      :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
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

  defp validate_http_headers(headers) do
    if headers == nil do
      true
    else
      is_map(headers)
    end
  end

  defp validate_http_url_params(params) do
    if params == nil do
      true
    else
      if is_map(params) do
        Map.keys(params)
        |> Enum.concat(Map.values(params))
        |> Enum.map(fn text ->
          check_bracket_close(text, "{{", "}}") and check_bracket_close(text, "{{{", "}}}") and check_no_single_bracket(text)
        end)
        |> Enum.all?()
      else
        false
      end
    end
  end

  defp check_bracket_close(text, open_bracket, close_bracket) do
    if String.contains?(text, open_bracket) do
      split_string_open = String.split(text, open_bracket)
      if length(split_string_open) == 2 do
        closing_text = Enum.at(split_string_open, 1)
        if String.contains?(closing_text, close_bracket) do
          split_string_open = String.split(text, close_bracket)
          if length(split_string_open) == 2 do
            true
          else
            false
          end
        else
          false
        end
      else
        false
      end
    else
      if String.contains?(text, close_bracket) do
        false
      else
        true
      end
    end
  end

  defp check_no_single_bracket(text) do
    cond do
      String.contains?(text, "{") and not String.contains?(text, "{{") -> false
      String.contains?(text, "}") and not String.contains?(text, "}}") -> false
      true -> true
    end
  end

  defp check_allowed_channel(channel) do
    allowed_types = Channel.get_allowed_integration_types()
    if (channel.type in allowed_types) do
      channel
    else
      Map.put(channel, :deactivated_by_console_host, true)
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
