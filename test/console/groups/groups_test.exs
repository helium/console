defmodule Console.GroupsTest do
  use Console.DataCase

  alias Console.Groups
  alias Console.Groups.Group
  alias Console.Devices.Device
  alias Console.Channels.Channel

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

    test "add_to_group/2 given channel and group adds channel to group" do
      team = insert(:team)
      channel = insert(:channel, %{team: team})
      group = insert(:group, %{team: team})

      assert (%Group{} = group) = Groups.add_to_group(channel, group)
      assert List.first(group.channels).id == channel.id

      # add another device
      channel2 = insert(:channel, %{team: team})
      assert (%Group{} = group) = Groups.add_to_group(channel2, group)
      channel_ids = for c <- group.channels, do: c.id
      assert Enum.all?([channel.id, channel2.id], fn c -> c in channel_ids end)
    end

    test "many_to_many relationship btwn devices and channels through groups" do
      team = insert(:team)
      channel = insert(:channel, %{team: team})
      device = insert(:device, %{team: team})
      group = insert(:group, %{team: team})

      Groups.add_to_group(channel, group)
      Groups.add_to_group(device, group)

      device = device |> Console.Devices.fetch_assoc([:channels])
      assert List.first(device.channels).id == channel.id

      channel = channel |> Console.Channels.fetch_assoc([:devices])
      assert List.first(channel.devices).id == device.id
    end
  end
end
