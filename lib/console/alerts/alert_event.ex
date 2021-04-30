defmodule Console.Alerts.AlertEvent do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "alert_events" do
    field :node_id, :binary_id
    field :node_type, :string
    field :details, :map
    field :sent, :boolean
    field :event, :string
    field :reported_at, :naive_datetime

    belongs_to :alert, Console.Alerts.Alert

    timestamps()
  end

  def changeset(devices_label, attrs) do
    devices_label
    |> cast(attrs, [:alert_id, :node_id, :node_type, :details, :sent, :event, :reported_at])
    |> validate_required([:alert_id, :node_id, :node_type, :details, :sent, :event, :reported_at])
    |> check_valid_event_key
  end

  defp check_valid_event_key(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{event: event}} ->
        invalid_event = Enum.member?([
          "device_deleted",
          "device_join_otaa_first_time",
          "device_stops_transmitting",
          "integration_stops_working",
          "integration_receives_first_event",
          "downlink_unsuccessful",
          "integration_with_devices_deleted",
          "integration_with_devices_updated"
        ], event) != true

        case invalid_event do
          true -> add_error(changeset, :message, "Alert event must have a valid event key")
          false -> changeset
        end
      _ -> changeset
    end
  end
end