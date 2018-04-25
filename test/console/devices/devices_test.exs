defmodule Console.DevicesTest do
  use Console.DataCase

  alias Console.Devices

  import Console.Factory

  describe "devices" do
    alias Console.Devices.Device

    @valid_attrs %{mac: "some mac", name: "some name", public_key: "some public_key"}
    @update_attrs %{mac: "some updated mac", name: "some updated name", public_key: "some updated public_key"}
    @invalid_attrs %{mac: nil, name: nil, public_key: nil}

    def device_fixture(attrs \\ %{}) do
      team = insert(:team)
      {:ok, device} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Enum.into(%{team_id: team.id})
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
      team = insert(:team)
      attrs = @valid_attrs |> Enum.into(%{team_id: team.id})
      assert {:ok, %Device{} = device} = Devices.create_device(attrs)
      assert device.mac == "some mac"
      assert device.name == "some name"
      assert device.public_key == "some public_key"
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
      assert device.public_key == "some updated public_key"
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

    test "change_device/1 returns a device changeset" do
      device = device_fixture()
      assert %Ecto.Changeset{} = Devices.change_device(device)
    end
  end
end
