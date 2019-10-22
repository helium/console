defmodule Console.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device
  alias Console.Gateways.Gateway
  alias Console.Channels.Channel

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field(:description, :string)
    field(:direction, :string)
    field(:payload, :string)
    field(:payload_size, :integer)
    field(:reported_at, :naive_datetime)
    field(:rssi, :float)
    field(:signal_strength, :integer)
    field(:status, :string)
    belongs_to(:device, Device)
    belongs_to(:gateway, Gateway)
    belongs_to(:channel, Channel)

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :description,
      :direction,
      :payload,
      :payload_size,
      :reported_at,
      :rssi,
      :signal_strength,
      :status,
      :device_id,
      :gateway_id,
      :channel_id
    ])
    |> put_reported_at_timestamp()
    |> validate_required([:reported_at])
    |> validate_required([:direction])
    |> validate_inclusion(:direction, ~w(inbound outbound))
  end

  defp put_reported_at_timestamp(changeset) do
    if Map.has_key?(changeset.changes, :reported_at) do
      changeset
    else
      put_change(changeset, :reported_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
    end
  end
end
