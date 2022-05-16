defmodule Console.PacketConfigs do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.PacketConfigs.PacketConfig
  alias Console.Devices.Device
  alias Console.Labels.Label

  def get_packet_config!(id), do: Repo.get!(PacketConfig, id)
  def get_packet_config(id), do: Repo.get(PacketConfig, id)

  def get_packet_config!(organization, id) do
    Repo.get_by!(PacketConfig, [id: id, organization_id: organization.id])
  end

  def get_all_organization_packet_configs(org_id) do
    from(m in PacketConfig, where: m.organization_id == ^org_id)
    |> Repo.all()
  end

  def create_packet_config(attrs \\ %{}) do
    %PacketConfig{}
    |> PacketConfig.changeset(attrs)
    |> Repo.insert()
  end

  def delete_packet_config(%PacketConfig{} = packet_config) do
    Repo.delete(packet_config)
  end

  def update_packet_config(%PacketConfig{} = packet_config, attrs) do
    packet_config
    |> PacketConfig.changeset(attrs)
    |> Repo.update()
  end

  def get_all_packet_config_associated_device_ids(id) do
    device_ids =
      get_associated_packet_config_devices(id)

    label_device_ids =
      get_associated_packet_config_labels(id)
      |> Enum.map(fn l -> l.devices end)
      |> List.flatten()
      |> Enum.map(fn d -> d.id end)

    device_ids ++ label_device_ids |> Enum.uniq()
  end

  defp get_associated_packet_config_devices(id) do
    from(d in Device, where: d.packet_config_id == ^id)
    |> select([d], d.id)
    |> Repo.all()
  end

  defp get_associated_packet_config_labels(id) do
    from(l in Label, where: l.packet_config_id == ^id)
    |> preload([:devices])
    |> Repo.all()
  end

  def turn_off_preferred_active_for_all(organization) do
    from(pc in PacketConfig, where: pc.organization_id == ^organization.id and pc.preferred_active == true)
    |> Repo.update_all(set: [preferred_active: false])
  end
end
