defmodule Console.Alerts.Alert do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Console.Helpers
  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "alerts" do
    field :name, :string
    field :last_triggered_at, :naive_datetime
    field :config, :map
    field :node_type, :string

    # has_many :alert_events, AlertEvent, on_delete: :delete_all
    # has_many :alert_nodes, AlertNode, on_delete: :delete_all
    belongs_to :organization, Organization
    timestamps()
  end

  def changeset(alert, attrs) do
    config = Helpers.drop_keys_with_empty_map(attrs["config"])
    attrs = Map.put(attrs, "config", Map.new(config))

    alert
    |> cast(attrs, [:name, :organization_id, :last_triggered_at, :config, :node_type])
    |> validate_required([:organization_id, :config, :node_type])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> check_config_not_empty
    |> check_webhook_config_url
    |> check_valid_event_key
  end

  defp check_config_not_empty(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{config: config}} ->
        empty_config = 
          case config do
            map when map == %{} -> true # must use guard since %{} matches any map
            _ -> false
        end

        case empty_config do
          true -> add_error(changeset, :message, "Alert must have at least one email or webhook setting turned on")
          false -> changeset
        end
      _ -> changeset
    end
  end

  defp check_webhook_config_url(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{config: config}} ->
        missing_url = Enum.any?(config, fn alert_event_config ->
          {_event_key, event_config} = alert_event_config
          if Map.has_key?(event_config, "webhook") do
            event_config["webhook"]["url"] != "" || event_config["webhook"]["url"] != nil
          else
            false
          end
        end)

        case missing_url do
          true -> add_error(changeset, :message, "Alert webhook must have URL")
          false -> changeset
        end
      _ -> changeset
    end
  end

  defp check_valid_event_key(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{config: config}} ->
        invalid_config = Enum.any?(config, fn alert_event_config ->
          {event_key, _event_config} = alert_event_config
          
          Enum.member?([
            "device_deleted",
            "device_join_otaa_first_time",
            "device_stops_transmitting",
            "integration_stops_working",
            "integration_receives_first_event",
            "downlink_unsuccessful",
            "integration_with_devices_deleted",
            "integration_with_devices_updated"
          ], event_key) != true
        end)

        case invalid_config do
          true -> add_error(changeset, :message, "Alert must have a valid event key")
          false -> changeset
        end
      _ -> changeset
    end
  end
end