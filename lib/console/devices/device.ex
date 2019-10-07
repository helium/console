defmodule Console.Devices.Device do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Team
  alias Console.Events.Event
  alias Console.Groups
  alias Console.Groups.Group
  alias Console.Channels.Channel
  alias Console.Groups.DevicesGroups
  alias Console.Devices
  alias Console.Devices.DevicesChannels


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices" do
    field :mac, :string
    field :name, :string
    field :key, :string
    field :seq_id, :integer
    field :oui, :integer

    belongs_to :team, Team
    has_many :events, Event, on_delete: :delete_all
    many_to_many :channels, Channel, join_through: DevicesChannels, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(device, attrs) do
    changeset =
      device
      |> cast(attrs, [:name, :mac, :key, :team_id, :seq_id])
      |> put_change(:oui, Application.fetch_env!(:console, :oui))
      |> validate_required([:name, :mac, :key, :team_id, :seq_id, :oui])
      |> unique_constraint(:mac)
  end
end
