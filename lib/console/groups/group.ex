defmodule Console.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device
  alias Console.Groups
  alias Console.Groups.DevicesGroup
  alias Console.Teams.Team

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "groups" do
    field(:name, :string)
    belongs_to(:team, Team)

    many_to_many(
      :devices,
      Device,
      join_through: DevicesGroup,
      on_replace: :delete
    )

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
end
