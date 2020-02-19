defmodule Console.Channels.ChannelResolver do
  alias Console.Repo
  alias Console.Channels.Channel
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    channels = Channel
      |> where([c], c.organization_id == ^current_organization.id)
      |> preload([:labels])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, channels}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    channel = Ecto.assoc(current_organization, :channels) |> Repo.get!(id)

    channel =
      case channel.type do
        "http" ->
          channel
          |> Map.put(:endpoint, channel.credentials["endpoint"])
          |> Map.put(:method, channel.credentials["method"])
          |> Map.put(:inbound_token, channel.credentials["inbound_token"])
          |> Map.put(:headers, Jason.encode!(channel.credentials["headers"]))
        _ -> channel
      end

    {:ok, channel}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    channels = Ecto.assoc(current_organization, :channels) |> Repo.all()
    {:ok, channels}
  end
end
