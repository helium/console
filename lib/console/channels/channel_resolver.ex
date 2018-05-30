defmodule Console.Channels.ChannelResolver do
  alias Console.Repo

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    channel = Ecto.assoc(current_team, :channels) |> Repo.get!(id)
    {:ok, channel}
  end
end
