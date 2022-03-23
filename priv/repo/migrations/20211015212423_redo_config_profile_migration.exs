defmodule Console.Repo.Migrations.RedoConfigProfileMigration do
  use Ecto.Migration
  alias Console.Repo
  alias Console.Devices
  alias Console.ConfigProfiles

  def cast(record) do
    %{
      id: Enum.at(record, 0),
      organization_id: Enum.at(record, 1),
      adr_allowed: Enum.at(record, 2),
      cf_list_enabled: Enum.at(record, 3),
    }
  end

  def up do
    # # Undo last config profile migration (FOR DEVICES ONLY)
    # # <- BEGIN ---------------------------
    #
    # # Delete all config profiles that are NOT applied to a label
    # Ecto.Adapters.SQL.query!(Console.Repo, """
    #   DELETE FROM config_profiles WHERE id NOT IN
    #     (SELECT DISTINCT(config_profile_id) FROM labels WHERE config_profile_id IS NOT NULL)
    # """)
    #
    # # (In case a profile applied to a label was also applied to a device before)
    # Ecto.Adapters.SQL.query!(Console.Repo, """
    #   UPDATE devices SET config_profile_id = NULL;
    # """)
    # # --------------------------- END ->
    #
    # devices_by_org =
    #   Devices.list_devices_no_disco_mode()
    #   |> Repo.preload([:labels])
    #   |> Enum.group_by(fn(d)-> d.organization_id end)
    #
    # Enum.each(devices_by_org, fn {organization_id, devices} ->
    #   {:ok, org_id} = Ecto.UUID.dump(organization_id)
    #   Enum.each(devices, fn device ->
    #     org_config_profiles = Ecto.Adapters.SQL.query!(Console.Repo, """
    #       SELECT id, organization_id, adr_allowed, cf_list_enabled FROM config_profiles WHERE organization_id = $1;
    #     """, [org_id]).rows |> Enum.map(fn p -> cast(p) end)
    #
    #     adr_allowed =
    #       case length(device.labels) do
    #         0 -> device.adr_allowed
    #         _ ->
    #           label_has_adr_allowed = device.labels |> Enum.map(fn l -> l.adr_allowed end) |> Enum.any?(fn s -> s == true end)
    #           if device.adr_allowed == true or label_has_adr_allowed do true else false end
    #       end
    #
    #     cf_list_enabled =
    #       case length(device.labels) do
    #         0 -> device.cf_list_enabled
    #         _ ->
    #           label_has_cf_enabled = device.labels |> Enum.map(fn l -> l.cf_list_enabled end) |> Enum.any?(fn s -> s == true end)
    #           if device.cf_list_enabled == true or label_has_cf_enabled do true else false end
    #       end
    #
    #     cond do
    #       adr_allowed and cf_list_enabled ->
    #         config_profile_1 = Enum.find(org_config_profiles, fn p -> p.adr_allowed and p.cf_list_enabled end)
    #         config_profile_id = case config_profile_1 do
    #           nil ->
    #             {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
    #               name: "Profile 1",
    #               organization_id: organization_id,
    #               adr_allowed: true,
    #               cf_list_enabled: true
    #             })
    #             config_profile.id
    #           _ ->
    #             {:ok, id} = Ecto.UUID.load(config_profile_1.id)
    #             id
    #         end
    #         Devices.update_config_profile_for_devices([device.id], config_profile_id, organization_id)
    #       adr_allowed and not cf_list_enabled ->
    #         config_profile_2 = Enum.find(org_config_profiles, fn p -> p.adr_allowed and not p.cf_list_enabled end)
    #         config_profile_id = case config_profile_2 do
    #           nil ->
    #             {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
    #               name: "Profile 2",
    #               organization_id: organization_id,
    #               adr_allowed: true,
    #               cf_list_enabled: false
    #             })
    #             config_profile.id
    #           _ ->
    #             {:ok, id} = Ecto.UUID.load(config_profile_2.id)
    #             id
    #         end
    #         Devices.update_config_profile_for_devices([device.id], config_profile_id, organization_id)
    #       not adr_allowed and cf_list_enabled ->
    #         config_profile_3 = Enum.find(org_config_profiles, fn p -> not p.adr_allowed and p.cf_list_enabled end)
    #         config_profile_id = case config_profile_3 do
    #           nil ->
    #             {:ok, config_profile} = ConfigProfiles.create_config_profile(%{
    #               name: "Profile 3",
    #               organization_id: organization_id,
    #               adr_allowed: false,
    #               cf_list_enabled: true
    #             })
    #             config_profile.id
    #           _ ->
    #             {:ok, id} = Ecto.UUID.load(config_profile_3.id)
    #             id
    #         end
    #         Devices.update_config_profile_for_devices([device.id], config_profile_id, organization_id)
    #       true ->
    #         # do nothing
    #     end
    #   end)
    # end)
  end

  def down do
    # Ecto.Adapters.SQL.query!(Console.Repo, """
    #   DELETE FROM config_profiles;
    # """)
  end
end
