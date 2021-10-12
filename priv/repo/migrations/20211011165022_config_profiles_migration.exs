defmodule Console.Repo.Migrations.ConfigProfilesMigration do
  use Ecto.Migration
  alias Console.ConfigProfiles
  alias Console.Devices
  alias Console.Labels

  def cast(record) do
    %{
      id: Enum.at(record, 0),
      organization_id: Enum.at(record, 1),
      adr_allowed: Enum.at(record, 2),
      cf_list_enabled: Enum.at(record, 3),
    }
  end

  def up do
    devices = Ecto.Adapters.SQL.query!(Console.Repo, """
      SELECT id, organization_id, adr_allowed, cf_list_enabled FROM devices ORDER BY organization_id;
    """).rows

    devices_by_org = Enum.map(devices, fn d -> cast(d) end) |> Enum.group_by(fn(d)-> d.organization_id end)

    Enum.each(devices_by_org, fn {org_id, devices} ->
      {:ok, organization_id} = Ecto.UUID.load(org_id)

      devices_config_profile_1 =
        Enum.filter(devices, fn d -> d.adr_allowed and d.cf_list_enabled end)
        |> Enum.map(fn d ->
          {:ok, device_id} = Ecto.UUID.load(d.id)
          device_id
        end)
      devices_config_profile_2 =
        Enum.filter(devices, fn d -> d.adr_allowed and not d.cf_list_enabled end)
        |> Enum.map(fn d ->
          {:ok, device_id} = Ecto.UUID.load(d.id)
          device_id
        end)
      devices_config_profile_3 =
        Enum.filter(devices, fn d -> not d.adr_allowed and d.cf_list_enabled end)
        |> Enum.map(fn d ->
          {:ok, device_id} = Ecto.UUID.load(d.id)
          device_id
        end)

      if length(devices_config_profile_1) > 0 do
        {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
          name: "Profile 1",
          organization_id: organization_id,
          adr_allowed: true,
          cf_list_enabled: true
        })

        Devices.update_config_profile_for_devices(devices_config_profile_1, config_profile.id, organization_id)
      end

      if length(devices_config_profile_2) > 0 do
        {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
          name: "Profile 2",
          organization_id: organization_id,
          adr_allowed: true,
          cf_list_enabled: false
        })

        Devices.update_config_profile_for_devices(devices_config_profile_2, config_profile.id, organization_id)
      end

      if length(devices_config_profile_3) > 0 do
        {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
          name: "Profile 3",
          organization_id: organization_id,
          adr_allowed: false,
          cf_list_enabled: true
        })

        Devices.update_config_profile_for_devices(devices_config_profile_3, config_profile.id, organization_id)
      end
    end)

    # NOW DO THE SAME FOR LABELS

    labels = Ecto.Adapters.SQL.query!(Console.Repo, """
      SELECT id, organization_id, adr_allowed, cf_list_enabled FROM labels ORDER BY organization_id;
    """).rows

    labels_by_org = Enum.map(labels, fn l -> cast(l) end) |> Enum.group_by(fn(l)-> l.organization_id end)

    Enum.each(labels_by_org, fn {org_id, labels} ->
      {:ok, organization_id} = Ecto.UUID.load(org_id)

      labels_config_profile_1 =
        Enum.filter(labels, fn l -> l.adr_allowed and l.cf_list_enabled end)
        |> Enum.map(fn l ->
          {:ok, label_id} = Ecto.UUID.load(l.id)
          label_id
        end)
      labels_config_profile_2 =
        Enum.filter(labels, fn l -> l.adr_allowed and not l.cf_list_enabled end)
        |> Enum.map(fn l ->
          {:ok, label_id} = Ecto.UUID.load(l.id)
          label_id
        end)
      labels_config_profile_3 =
        Enum.filter(labels, fn l -> not l.adr_allowed and l.cf_list_enabled end)
        |> Enum.map(fn l ->
          {:ok, label_id} = Ecto.UUID.load(l.id)
          label_id
        end)

      org_config_profiles = Ecto.Adapters.SQL.query!(Console.Repo, """
        SELECT id, organization_id, adr_allowed, cf_list_enabled FROM config_profiles WHERE organization_id = $1;
      """, [org_id]).rows |> Enum.map(fn p -> cast(p) end)

      if length(labels_config_profile_1) > 0 do
        config_profile_1 = Enum.find(org_config_profiles, fn p -> p.adr_allowed and p.cf_list_enabled end)
        config_profile_id = case config_profile_1 do
          nil ->
            {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
              name: "Profile 1",
              organization_id: organization_id,
              adr_allowed: true,
              cf_list_enabled: true
            })
            config_profile.id
          _ ->
            {:ok, id} = Ecto.UUID.load(config_profile_1.id)
            id
        end

        Labels.update_config_profile_for_labels(labels_config_profile_1, config_profile_id, organization_id)
      end

      if length(labels_config_profile_2) > 0 do
        config_profile_2 = Enum.find(org_config_profiles, fn p -> p.adr_allowed and not p.cf_list_enabled end)
        config_profile_id = case config_profile_2 do
          nil ->
            {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
              name: "Profile 2",
              organization_id: organization_id,
              adr_allowed: true,
              cf_list_enabled: false
            })
            config_profile.id
          _ ->
            {:ok, id} = Ecto.UUID.load(config_profile_2.id)
            id
        end

        Labels.update_config_profile_for_labels(labels_config_profile_2, config_profile_id, organization_id)
      end

      if length(labels_config_profile_3) > 0 do
        config_profile_3 = Enum.find(org_config_profiles, fn p -> not p.adr_allowed and p.cf_list_enabled end)
        config_profile_id = case config_profile_3 do
          nil ->
            {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
              name: "Profile 3",
              organization_id: organization_id,
              adr_allowed: false,
              cf_list_enabled: true
            })
            config_profile.id
          _ ->
            {:ok, id} = Ecto.UUID.load(config_profile_3.id)
            id
        end

        Labels.update_config_profile_for_labels(labels_config_profile_3, config_profile_id, organization_id)
      end
    end)
  end
  
  def down do
    Ecto.Adapters.SQL.query!(Console.Repo, """
      DELETE FROM config_profiles;
    """)
  end
end
