defmodule Console.Alerts.Alert do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

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
    alert
    |> cast(attrs, [:name, :organization_id, :last_triggered_at, :config, :node_type])
    |> validate_required([:organization_id, :config, :node_type])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> check_config_not_empty
  end

  defp check_config_not_empty(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{config: config}} ->
        valid_config = config != %{"email" => %{}, "webhook" => %{}}

        case valid_config do
          false -> add_error(changeset, :message, "Alert must have at least one email or webhook setting turned on")
          true -> changeset
        end
      _ -> changeset
    end
  end
end