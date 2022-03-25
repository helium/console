defmodule Console.Channels.ChannelResolver do
  alias Console.Repo
  alias Console.Channels.Channel
  alias Console.Flows
  import Ecto.Query
  alias Console.Alerts

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    channels = Channel
      |> where([c], c.organization_id == ^current_organization.id)
      |> Repo.paginate(page: page, page_size: page_size)

    updated_entries = channels.entries
      |> Enum.map(fn c ->
        Map.drop(c, [:downlink_token])
        |> Map.put(:number_devices, Flows.get_number_devices_in_flows_with_channel(current_organization, c.id))
      end)

    {:ok, Map.put(channels, :entries, updated_entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization, current_membership: current_membership }}) do
    channel = Channel
      |> where([c], c.id == ^id and c.organization_id == ^current_organization.id)
      |> Repo.one!()

    channel = channel |> Map.put(:number_devices, Flows.get_number_devices_in_flows_with_channel(current_organization, id))

    channel =
      case channel.type do
        "http" ->
          channel
          |> Map.put(:endpoint, channel.credentials["endpoint"])
          |> Map.put(:method, channel.credentials["method"])
          |> Map.put(:inbound_token, channel.credentials["inbound_token"])
          |> Map.put(:headers, Jason.encode!(channel.credentials["headers"]))
          |> Map.put(:url_params, Jason.encode!(channel.credentials["url_params"]))
        "aws" ->
          channel
          |> Map.put(:aws_region, channel.credentials["aws_region"])
          |> Map.put(:aws_access_key, channel.credentials["aws_access_key"])
          |> Map.put(:topic, channel.credentials["topic"])
        "azure" ->
          channel
          |> Map.put(:azure_hub_name, channel.credentials["azure_hub_name"])
          |> Map.put(:azure_policy_name, channel.credentials["azure_policy_name"])
          |> Map.put(:azure_policy_key, channel.credentials["azure_policy_key"])
        "iot_central" ->
          channel
          |> Map.put(:iot_central_api_key, channel.credentials["iot_central_api_key"])
          |> Map.put(:iot_central_scope_id, channel.credentials["iot_central_scope_id"])
          |> Map.put(:iot_central_app_name, channel.credentials["iot_central_app_name"])
        "mqtt" ->
          channel
          |> Map.put(:credentials, %{
            endpoint: channel.credentials["endpoint"],
            uplink: %{
              topic: channel.credentials["uplink"]["topic"]
            },
            downlink: %{
              topic: channel.credentials["downlink"]["topic"]
            }
          })
          |> Map.put(:endpoint, channel.credentials["endpoint"])
        _ ->
          channel
      end

    channel =
      case current_membership.role do
        "read" ->
          channel
          |> Map.drop([:downlink_token])
        _ ->
          channel
      end

    {:ok, channel}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    channels = Ecto.assoc(current_organization, :channels) |> Repo.all()

    channels =
      Enum.map(channels, fn channel ->
        case channel.type do
          "http" ->
            channel
            |> Map.put(:endpoint, channel.credentials["endpoint"])
          "mqtt" ->
            channel
            |> Map.put(:endpoint, channel.credentials["endpoint"])
          _ ->
            channel
        end
      end)
      |> Enum.map(fn c ->
        Map.drop(c, [:downlink_token])
        |> Map.put(:alerts, Alerts.get_alerts_by_node(c.id, "integration"))
      end)

    {:ok, channels}
  end

  def get_names(%{channel_ids: channel_ids}, %{context: %{current_organization: current_organization}}) do
    query = from c in Channel,
      where: c.organization_id == ^current_organization.id and c.id in ^channel_ids

    {:ok, query |> Repo.all()}
  end
end
