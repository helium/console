defmodule Console.ChannelsTest do
  use Console.DataCase

  alias Console.Channels

  import Console.Factory

  describe "channels" do
    alias Console.Channels.Channel

    @valid_creds %{"a field" => "a value"}
    @updated_creds %{"a field" => "a value", "another field" => "another value"}
    @valid_attrs %{active: true, credentials: @valid_creds, name: "some name", type: "some type"}
    @update_attrs %{active: false, credentials: @updated_creds, name: "some updated name", type: "some updated type"}
    @invalid_attrs %{active: nil, credentials: nil, name: nil, type: nil}

    def channel_fixture(attrs \\ %{}) do
      team = insert(:team)
      {:ok, channel} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Enum.into(%{team_id: team.id})
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
      team = insert(:team)
      attrs = @valid_attrs |> Enum.into(%{team_id: team.id})
      assert {:ok, %Channel{} = channel} = Channels.create_channel(attrs)
      assert channel.active == true
      assert channel.credentials == @valid_creds
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
      assert channel.credentials == @updated_creds
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
