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

  def get_organization_channel_count(organization) do
    channels = from(d in Channel, where: d.organization_id == ^organization.id) |> Repo.all()
    length(channels)
  end

  def get_channel!(id), do: Repo.get!(Channel, id)

  def get_channel(id), do: Repo.get(Channel, id)

  def get_channel!(organization, id) do
     Repo.get_by!(Channel, [id: id, organization_id: organization.id])
  end

  def get_channel(organization, id) do
     Repo.get_by(Channel, [id: id, organization_id: organization.id])
  end

  def fetch_assoc(%Channel{} = channel, assoc \\ [:organization]) do
    Repo.preload(channel, assoc)
  end

  def create_channel(%Organization{} = organization, attrs \\ %{}) do
    count = get_organization_channel_count(organization)
    cond do
      count > 9999 ->
        {:error, :forbidden, "Channel limit for organization reached"}
      true ->
        %Channel{}
        |> Channel.create_changeset(attrs)
        |> Repo.insert()
    end
  end

  def update_channel(%Channel{} = channel, %Organization{} = organization, attrs) do
    channel
    |> Channel.update_changeset(attrs)
    |> Repo.update()
  end

  def router_update_channel(%Channel{} = channel, attrs) do
    channel
    |> Channel.update_changeset(attrs)
    |> Repo.update()
  end

  def delete_channel(%Channel{} = channel) do
    Repo.delete(channel)
  end
end
