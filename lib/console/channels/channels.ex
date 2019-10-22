defmodule Console.Channels do
  @moduledoc """
  The Channels context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Channels.Channel

  def list_channels do
    Repo.all(Channel)
  end

  def get_channel!(id), do: Repo.get!(Channel, id)

  def get_default_channel(), do: Repo.get_by(Channel, default: true)

  def fetch_assoc(%Channel{} = channel, assoc \\ [:organization]) do
    Repo.preload(channel, assoc)
  end

  def create_channel(attrs \\ %{}) do
    attrs =
      case list_channels() do
        [] -> Map.put(attrs, "default", true)
        _ -> attrs
      end
    %Channel{}
    |> Channel.create_changeset(attrs)
    |> Repo.insert()
  end

  def update_channel(%Channel{} = channel, attrs) do
    case attrs["default"] do
      true ->
        default_channel = get_default_channel()
        if default_channel != nil do
          default_channel
          |> Channel.update_changeset(%{ "default" => false })
          |> Repo.update()
        end
      _ -> nil    
    end

    channel
    |> Channel.update_changeset(attrs)
    |> Repo.update()
  end

  def delete_channel(%Channel{} = channel) do
    Repo.delete(channel)
  end
end
