defmodule Console.DevicesTest do
  use Console.DataCase

  alias Console.Devices

  import Console.Factory

  describe "devices" do
    alias Console.Devices.Device
    alias Console.Devices.DevicesChannels

    @valid_attrs %{"mac" => "some mac", "name" => "some name", "dev_eui" => "randomeui"}
    @update_attrs %{"mac" => "some updated mac", "name" => "some updated name"}
    @invalid_attrs %{"mac" => nil, "name" => nil}

    def device_fixture(attrs \\ %{}) do
      organization = insert(:organization)
      {:ok, device} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Enum.into(%{"organization_id" => organization.id})
        |> Devices.create_device()

      device
    end

    test "list_devices/0 returns all devices" do
      device = device_fixture()
      assert length(Devices.list_devices()) == 1
    end

    test "get_device!/1 returns the device with given id" do
      device = device_fixture()
      assert Devices.get_device!(device.id).id == device.id
    end

    test "create_device/1 with valid data creates a device" do
      organization = insert(:organization)
      attrs = @valid_attrs |> Enum.into(%{"organization_id" => organization.id})
      assert {:ok, %Device{} = device} = Devices.create_device(attrs)
      assert device.mac == "some mac"
      assert device.name == "some name"
    end

    test "create_device/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Devices.create_device(@invalid_attrs)
    end

    test "update_device/2 with valid data updates the device" do
      device = device_fixture()
      assert {:ok, device} = Devices.update_device(device, @update_attrs)
      assert %Device{} = device
      assert device.mac == "some updated mac"
      assert device.name == "some updated name"
    end

    test "update_device/2 with invalid data returns error changeset" do
      device = device_fixture()
      assert {:error, %Ecto.Changeset{}} = Devices.update_device(device, @invalid_attrs)
    end

    test "delete_device/1 deletes the device" do
      device = device_fixture()
      assert {:ok, %Device{}} = Devices.delete_device(device)
      assert_raise Ecto.NoResultsError, fn -> Devices.get_device!(device.id) end
    end

    test "set_device_channel/2 sets a channel on the device" do
      device = device_fixture()
      channel = insert(:channel)
      assert {:ok, %DevicesChannels{} = dc} = Devices.set_device_channel(device, channel)
      assert dc.device_id == device.id
      assert dc.channel_id == channel.id
      device = Devices.fetch_assoc(device)
      assert List.first(device.channels).id == channel.id
    end

    test "delete_device_channel/2 deletes a channel on the device" do
      device = device_fixture()
      channel = insert(:channel)
      assert {:ok, %DevicesChannels{} = dc} = Devices.set_device_channel(device, channel)
      assert dc.device_id == device.id
      assert dc.channel_id == channel.id
      assert {:ok, %DevicesChannels{}} = Devices.delete_device_channel(device, channel.id)
      device = Devices.fetch_assoc(device)
      assert device.channels == []
    end
  end
end
