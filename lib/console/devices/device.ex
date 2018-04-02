defmodule Console.Devices.Device do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Team
  alias Console.Events.Event


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices" do
    field :mac, :string
    field :name, :string
    field :public_key, :binary

    belongs_to :team, Team
    has_many :events, Event

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
