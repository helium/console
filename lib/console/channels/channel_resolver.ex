defmodule Console.Channels.ChannelResolver do
  alias Console.Repo
  alias Console.Channels.Channel
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    channels = Channel
      |> where([c], c.organization_id == ^current_organization.id)
      |> preload([{:labels, [:devices, :function]}])
      |> Repo.paginate(page: page, page_size: page_size)

    updated_entries = channels.entries
      |> Enum.map(fn c ->
        device_count = Enum.map(c.labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> length()
        Map.put(c, :device_count, device_count)
      end)
      |> Enum.map(fn c ->
        Map.drop(c, [:downlink_token])
      end)
      |> Enum.map(fn c ->
        Map.put(c, :labels,
          Enum.map(c.labels, fn l ->
            Map.drop(l, [:devices])
          end)
        )
      end)

    {:ok, Map.put(channels, :entries, updated_entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization, current_membership: current_membership }}) do
    channel = Channel
      |> where([c], c.id == ^id and c.organization_id == ^current_organization.id)
      |> preload([labels: :devices])
      |> Repo.one!()

    devices =
      case length(channel.labels) do
        0 -> []
        _ -> Enum.map(channel.labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> Map.drop(d, [:app_key]) end)
      end

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
        "read" ->
          channel
          |> Map.drop([:downlink_token])
          |> Map.put(:labels,
            Enum.map(channel.labels, fn l ->
              Map.drop(l, [:devices])
            end)
          )
          |> Map.put(:devices, devices)
        _ ->
          channel
          |> Map.put(:devices, devices)
      end

    {:ok, channel}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    channels =
      Ecto.assoc(current_organization, :channels)
      |> Repo.all()
      |> Enum.map(fn c ->
        Map.drop(c, [:downlink_token])
      end)

    {:ok, channels}
  end
end
