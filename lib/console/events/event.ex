defmodule Console.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field :hotspot_name, :string
    field :channel_name, :string
    field :status, :string
    field :description, :string
    field :size, :integer
    field :rssi, :float
    field :snr, :float
    field :category, :string
    field :frame_up, :integer
    field :frame_down, :integer
    field :reported_at, :naive_datetime

    belongs_to :device, Device

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :hotspot_name,
      :channel_name,
      :status,
      :description,
      :size,
      :rssi,
      :snr,
      :category,
      :frame_up,
      :frame_down,
      :reported_at,
    ])
    |> put_reported_at_timestamp()
    |> validate_required([:reported_at, :status, :description, :device_id])
  end

  defp put_reported_at_timestamp(changeset) do
    if Map.has_key?(changeset.changes, :reported_at) do
      changeset
    else
      put_change(changeset, :reported_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
    end
  end
end
