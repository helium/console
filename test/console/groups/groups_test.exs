defmodule Console.GroupsTest do
  use Console.DataCase

  alias Console.Groups
  alias Console.Groups.Group
  alias Console.Devices.Device

  import Console.Factory

  describe "groups" do
    test "create_group/2 given team with valid data creates a group" do
      team = insert(:team)
      attrs = %{name: "All devices"}

      assert {:ok, %Group{} = group} = Groups.create_group(team, attrs)
      assert group.name == attrs.name
      assert group.team_id == team.id
    end

    test "create_user/2 given team with invalid data returns error changeset" do
      team = insert(:team)
      assert {:error, %Ecto.Changeset{}} = Groups.create_group(team, %{})
    end

    test "add_to_group/2 given device and group adds device to group" do
      team = insert(:team)
      device = insert(:device, %{team: team})
      group = insert(:group, %{team: team})

      assert (%Group{} = group) = Groups.add_to_group(device, group)
      assert List.first(group.devices).id == device.id

      # add another device
      device2 = insert(:device, %{team: team})
      assert (%Group{} = group) = Groups.add_to_group(device2, group)
      device_ids = for d <- group.devices, do: d.id
      assert Enum.all?([device.id, device2.id], fn d -> d in device_ids end)
    end
  end
end
