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
    |> validate_required([:name, :organization_id, :config, :node_type])
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
  end
end