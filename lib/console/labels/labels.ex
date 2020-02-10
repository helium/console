defmodule Console.Labels do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Devices.Device
  alias Console.Organizations

  def get_label!(id), do: Repo.get!(Label, id)

  def create_label(attrs \\ %{}) do
    %Label{}
    |> Label.changeset(attrs)
    |> Repo.insert()
  end

  def update_label(%Label{} = label, attrs) do
    label
    |> Label.changeset(attrs)
    |> Repo.update()
  end

  def delete_label(%Label{} = label) do
    Repo.delete(label)
  end

  def add_devices_to_labels(devices, labels, organization) do
    devices_labels =
      Enum.reduce(labels, [], fn label_id, acc ->
        acc ++ Enum.reduce(devices, [], fn device_id, acc ->
          Repo.get_by!(Device, id: device_id, organization_id: organization.id)
          Repo.get_by!(Label, id: label_id, organization_id: organization.id)

          if Repo.get_by(DevicesLabels, device_id: device_id, label_id: label_id) == nil do
            acc ++ [%{ device_id: device_id, label_id: label_id }]
          else
            acc
          end
        end)
      end)

    Repo.transaction(fn ->
      Enum.each(devices_labels, fn attrs ->
        Repo.insert!(DevicesLabels.changeset(%DevicesLabels{}, attrs))
      end)
    end)
  end
end
