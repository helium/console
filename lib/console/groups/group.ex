defmodule Console.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Groups
  alias Console.Groups.DevicesGroups
  alias Console.Groups.ChannelsGroups
  alias Console.Teams.Team
  alias Console.Devices.Device
  alias Console.Channels.Channel

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "groups" do
    field :name, :string
    belongs_to :team, Team
    many_to_many :devices, Device, join_through: DevicesGroups, on_replace: :delete
    many_to_many :channels, Channel, join_through: ChannelsGroups, on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(group, attrs \\ %{}) do
    group
    |> cast(attrs, [:name, :team_id])
    |> validate_required([:name, :team_id])
  end

  @doc false
  def assoc_device_changeset(group, %Device{} = device) do
    group = group |> Groups.fetch_assoc([:devices])

    group
    |> changeset()
    |> put_assoc(:devices, [device | group.devices])
  end

  @doc false
  def assoc_channel_changeset(group, %Channel{} = channel) do
    group = group |> Groups.fetch_assoc([:channels])

    group
    |> changeset()
    |> put_assoc(:channels, [channel | group.channels])
  end
end
