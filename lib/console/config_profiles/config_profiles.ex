defmodule Console.ConfigProfiles do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.ConfigProfiles.ConfigProfile
  alias Console.Devices.Device
  alias Console.Labels.Label

  def get_config_profile!(id), do: Repo.get!(ConfigProfile, id)
  def get_config_profile(id), do: Repo.get(ConfigProfile, id)

  def get_config_profile!(organization, id) do
    Repo.get_by!(ConfigProfile, [id: id, organization_id: organization.id])
  end

  def create_config_profile(attrs \\ %{}) do
    %ConfigProfile{}
    |> ConfigProfile.changeset(attrs)
    |> Repo.insert()
  end

  def delete_config_profile(%ConfigProfile{} = config_profile) do
    Repo.delete(config_profile)
  end

  def update_config_profile(%ConfigProfile{} = config_profile, attrs) do
    config_profile
    |> ConfigProfile.changeset(attrs)
    |> Repo.update()
  end

  def get_all_config_profile_associated_device_ids(id) do
    device_ids =
      get_associated_config_profile_devices(id)

    label_device_ids =
      get_associated_config_profile_labels(id)
      |> Enum.map(fn l -> l.devices end)
      |> List.flatten()
      |> Enum.map(fn d -> d.id end)

    device_ids ++ label_device_ids |> Enum.uniq()
  end

  defp get_associated_config_profile_devices(id) do
    from(d in Device, where: d.config_profile_id == ^id)
    |> select([d], d.id)
    |> Repo.all()
  end

  defp get_associated_config_profile_labels(id) do
    from(l in Label, where: l.config_profile_id == ^id)
    |> preload([:devices])
    |> Repo.all()
  end
end
