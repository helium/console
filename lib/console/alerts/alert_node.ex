defmodule Console.Alerts.AlertNode do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "alert_nodes" do
    field :node_id, :binary_id
    field :node_type, :string

    belongs_to :alert, Console.Alerts.Alert

    timestamps()
  end

  def changeset(devices_label, attrs) do
    devices_label
    |> cast(attrs, [:alert_id, :node_id, :node_type])
    |> validate_required([:alert_id, :node_id, :node_type])
    |> unique_constraint([:alert_id, :node_id, :node_type], name: :alert_nodes_alert_id_node_id_node_type_index, message: "Alert already added to node")
  end
end