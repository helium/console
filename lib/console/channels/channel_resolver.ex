defmodule Console.Channels.ChannelResolver do
  alias Console.Repo
  alias Console.Channels.Channel
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    device_count_query = from(
      c in Channel,
      join: l in assoc(c, :labels),
      join: d in assoc(l, :devices),
      select: {c.id, count(d.id)},
      group_by: c.id
    )

    device_count_map =
      Repo.all(device_count_query)
      |> Enum.reduce(%{}, fn ({key, value}, acc) -> Map.put(acc, key, value) end)

    channels = Channel
      |> where([c], c.organization_id == ^current_organization.id)
      |> preload([:labels])
      |> Repo.paginate(page: page, page_size: page_size)

    updated_entries = channels.entries
      |> Enum.map(fn c -> Map.put(c, :device_count, device_count_map[c.id]) end)

    {:ok, Map.put(channels, :entries, updated_entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    channel = Channel
      |> where([c], c.id == ^id and c.organization_id == ^current_organization.id)
      |> preload([:labels])
      |> Repo.one!()

    devices =
      case length(channel.labels) do
        0 -> []
        _ -> Ecto.assoc(channel.labels, :devices) |> Repo.all() |> Enum.uniq()
      end
      
    channel =
      case channel.type do
        "http" ->
          channel
          |> Map.put(:endpoint, channel.credentials["endpoint"])
          |> Map.put(:method, channel.credentials["method"])
          |> Map.put(:inbound_token, channel.credentials["inbound_token"])
          |> Map.put(:headers, Jason.encode!(channel.credentials["headers"]))
          |> Map.put(:devices, devices)
        _ ->
          channel
          |> Map.put(:devices, devices)
      end

    {:ok, channel}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    channels = Ecto.assoc(current_organization, :channels) |> Repo.all()
    {:ok, channels}
  end
end
