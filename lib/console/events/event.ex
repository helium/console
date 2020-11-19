defmodule Console.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field :category, :string
    field :description, :string
    field :reported_at, :string
    field :reported_at_epoch, :integer
    field :reported_at_naive, :naive_datetime
    field :frame_up, :integer
    field :frame_down, :integer
    field :payload_size, :integer
    field :port, :integer
    field :dc_used, :integer
    field :devaddr, :string
    field :hotspots, {:array, :map}
    field :channels, {:array, :map}

    belongs_to :device, Device
    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :hotspots,
      :channels,
      :description,
      :payload_size,
      :category,
      :frame_up,
      :frame_down,
      :reported_at,
      :reported_at_naive,
      :reported_at_epoch,
      :device_id,
      :port,
      :devaddr,
      :dc_used,
    ])
  end
end
