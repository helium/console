defmodule Console.Channels do
  @moduledoc """
  The Channels context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Channels.Channel
  alias Console.Organizations.Organization
  alias Console.Organizations

  def list_channels do
    Repo.all(Channel)
  end

  def get_channel!(id), do: Repo.get!(Channel, id)

  def fetch_assoc(%Channel{} = channel, assoc \\ [:organization]) do
    Repo.preload(channel, assoc)
  end

  def create_channel(%Organization{} = organization, attrs \\ %{}) do
    %Channel{}
    |> Channel.create_changeset(attrs)
    |> Repo.insert()
  end

  def update_channel(%Channel{} = channel, %Organization{} = organization, attrs) do
    channel
    |> Channel.update_changeset(attrs)
    |> Repo.update()
  end

  def delete_channel(%Channel{} = channel) do
    Repo.delete(channel)
  end
end
