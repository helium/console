defmodule Console.ChannelsTest do
  use Console.DataCase

  alias Console.Channels

  describe "channels" do
    alias Console.Channels.Channel

    @valid_attrs %{active: true, credentials: "some credentials", name: "some name", type: "some type"}
    @update_attrs %{active: false, credentials: "some updated credentials", name: "some updated name", type: "some updated type"}
    @invalid_attrs %{active: nil, credentials: nil, name: nil, type: nil}

    def channel_fixture(attrs \\ %{}) do
      {:ok, channel} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Channels.create_channel()

      channel
    end

    test "list_channels/0 returns all channels" do
      channel = channel_fixture()
      assert Channels.list_channels() == [channel]
    end

    test "get_channel!/1 returns the channel with given id" do
      channel = channel_fixture()
      assert Channels.get_channel!(channel.id) == channel
    end

    test "create_channel/1 with valid data creates a channel" do
      assert {:ok, %Channel{} = channel} = Channels.create_channel(@valid_attrs)
      assert channel.active == true
      assert channel.credentials == "some credentials"
      assert channel.name == "some name"
      assert channel.type == "some type"
    end

    test "create_channel/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Channels.create_channel(@invalid_attrs)
    end

    test "update_channel/2 with valid data updates the channel" do
      channel = channel_fixture()
      assert {:ok, channel} = Channels.update_channel(channel, @update_attrs)
      assert %Channel{} = channel
      assert channel.active == false
      assert channel.credentials == "some updated credentials"
      assert channel.name == "some updated name"
      assert channel.type == "some updated type"
    end

    test "update_channel/2 with invalid data returns error changeset" do
      channel = channel_fixture()
      assert {:error, %Ecto.Changeset{}} = Channels.update_channel(channel, @invalid_attrs)
      assert channel == Channels.get_channel!(channel.id)
    end

    test "delete_channel/1 deletes the channel" do
      channel = channel_fixture()
      assert {:ok, %Channel{}} = Channels.delete_channel(channel)
      assert_raise Ecto.NoResultsError, fn -> Channels.get_channel!(channel.id) end
    end

    test "change_channel/1 returns a channel changeset" do
      channel = channel_fixture()
      assert %Ecto.Changeset{} = Channels.change_channel(channel)
    end
  end
end
