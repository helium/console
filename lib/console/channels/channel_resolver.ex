defmodule Console.Channels.ChannelResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    channels =
      Ecto.assoc(current_organization, :channels)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, channels}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    channel = Ecto.assoc(current_organization, :channels) |> Repo.get!(id) |> Repo.preload([:devices])
    channel = channel
      |> Map.put(:endpoint, channel.credentials["endpoint"])
      |> Map.put(:method, channel.credentials["method"])
      |> Map.put(:inbound_token, channel.credentials["inbound_token"])

    {:ok, channel}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    channels = Ecto.assoc(current_organization, :channels) |> Repo.all()
    {:ok, channels}
  end
end
