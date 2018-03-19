defmodule Console.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field :description, :string
    field :direction, :string
    field :payload, :string
    field :payload_size, :integer
    field :reported_at, :naive_datetime
    field :rssi, :float
    field :signal_strength, :integer
    field :status, :string
    field :device_id, :binary_id
    field :gateway_id, :binary_id
    field :channel_id, :binary_id

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:description, :direction, :payload, :payload_size, :reported_at, :rssi, :signal_strength, :status])
    |> validate_required([:description, :direction, :payload, :payload_size, :reported_at, :rssi, :signal_strength, :status])
  end
end
