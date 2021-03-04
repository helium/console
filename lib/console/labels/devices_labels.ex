defmodule Console.Labels.DevicesLabels do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices_labels" do
    belongs_to :label, Console.Labels.Label
    belongs_to :device, Console.Devices.Device

    timestamps()
  end

  @doc false
  def changeset(devices_label, attrs) do
    devices_label
    |> cast(attrs, [:device_id, :label_id])
    |> validate_required([:device_id, :label_id])
    |> unique_constraint(:device_id, name: :devices_labels_device_id_label_id_index, message: "Device already added to Label")
  end
end
