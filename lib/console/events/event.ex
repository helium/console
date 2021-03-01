defmodule Console.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device
  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field :category, :string
    field :sub_category, :string
    field :description, :string
    field :reported_at, :string
    field :reported_at_epoch, :integer
    field :reported_at_naive, :naive_datetime
    field :data, :map
    field :router_uuid, :string

    belongs_to :device, Device
    belongs_to :organization, Organization
    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :data,
      :description,
      :category,
      :sub_category,
      :reported_at,
      :reported_at_naive,
      :reported_at_epoch,
      :device_id,
      :organization_id,
      :router_uuid
    ])
  end
end
