defmodule Console.Devices.Device do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Team
  alias Console.Events.Event
  alias Console.Groups.Group
  alias Console.Groups.DevicesGroups


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices" do
    field :mac, :string
    field :name, :string
    field :public_key, :binary

    belongs_to :team, Team
    has_many :events, Event, on_delete: :delete_all
    many_to_many :groups, Group, join_through: DevicesGroups
    has_many :channels, through: [:groups, :channels]

    timestamps()
  end

  @doc false
  def changeset(device, attrs) do
    device
    |> cast(attrs, [:name, :mac, :public_key, :team_id])
    |> validate_required([:name, :mac, :public_key, :team_id])
    |> unique_constraint(:mac)
  end
end
