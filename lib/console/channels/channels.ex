defmodule Console.Channels do
  @moduledoc """
  The Channels context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Channels.Channel
  alias Console.Teams.Organization
  alias Console.Teams.Organizations

  def list_channels do
    Repo.all(Channel)
  end

  def list_organization_channels(organization) do
    Organizations.fetch_assoc(organization, [:channels]).channels
  end

  def get_channel!(id), do: Repo.get!(Channel, id)

  def get_default_channel(organization), do: Repo.get_by(Channel, [default: true, organization_id: organization.id])

  def fetch_assoc(%Channel{} = channel, assoc \\ [:organization]) do
    Repo.preload(channel, assoc)
  end

  def create_channel(%Organization{} = organization, attrs \\ %{}) do
    attrs =
      case list_organization_channels(organization) do
        [] -> Map.put(attrs, "default", true)
        _ -> attrs
      end
    %Channel{}
    |> Channel.create_changeset(attrs)
    |> Repo.insert()
  end

  def update_channel(%Channel{} = channel, %Organization{} = organization, attrs) do
    case attrs["default"] do
      true ->
        default_channel = get_default_channel(organization)
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
