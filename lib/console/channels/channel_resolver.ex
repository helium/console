defmodule Console.Channels.ChannelResolver do
  alias Console.Repo
  alias Console.Channels.Channel
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    channels = Channel
      |> where([c], c.organization_id == ^current_organization.id)
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, channels}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization, current_membership: current_membership }}) do
    channel = Channel
      |> where([c], c.id == ^id and c.organization_id == ^current_organization.id)
      |> Repo.one!()

    channel =
      case channel.type do
        "http" ->
          channel
          |> Map.put(:endpoint, channel.credentials["endpoint"])
          |> Map.put(:method, channel.credentials["method"])
          |> Map.put(:inbound_token, channel.credentials["inbound_token"])
          |> Map.put(:headers, Jason.encode!(channel.credentials["headers"]))
        "aws" ->
          channel
          |> Map.put(:aws_region, channel.credentials["aws_region"])
          |> Map.put(:aws_access_key, channel.credentials["aws_access_key"])
          |> Map.put(:topic, channel.credentials["topic"])
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
        _ ->
          channel
      end

    channel =
      case current_membership.role do
        "read" -> channel |> Map.put(:downlink_token, nil)
        _ -> channel
      end

    {:ok, channel}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    channels = Ecto.assoc(current_organization, :channels) |> Repo.all()

    channels = Enum.map(channels, fn channel ->
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

    {:ok, channels}
  end

  def get_names(%{channel_ids: channel_ids}, %{context: %{current_organization: current_organization}}) do
    query = from c in Channel,
      where: c.organization_id == ^current_organization.id and c.id in ^channel_ids

    {:ok, query |> Repo.all()}
  end
end
