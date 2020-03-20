defmodule Console.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field :hotspot_name, :string
    field :channel_name, :string
    field :hotspots, {:array, :map}
    field :channels, {:array, :map}
    field :status, :string
    field :description, :string
    field :payload, :string
    field :payload_size, :integer
    field :rssi, :float
    field :snr, :float
    field :category, :string
    field :frame_up, :integer
    field :frame_down, :integer
    field :reported_at, :string
    field :reported_at_naive, :naive_datetime

    belongs_to :device, Device
    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :hotspot_name,
      :channel_name,
      :hotspots,
      :channels,
      :status,
      :description,
      :payload,
      :payload_size,
      :rssi,
      :snr,
      :category,
      :frame_up,
      :frame_down,
      :reported_at,
      :reported_at_naive,
      :device_id,
    ])
  end
end
