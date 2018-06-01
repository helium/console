defmodule Console.Channels.ChannelResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    channels =
      Ecto.assoc(current_team, :channels)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, channels}
  end

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    channel = Ecto.assoc(current_team, :channels) |> Repo.get!(id)
    {:ok, channel}
  end
end
