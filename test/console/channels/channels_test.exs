defmodule Console.ChannelsTest do
  use Console.DataCase

  alias Console.Channels

  import Console.Factory

  describe "channels" do
    alias Console.Channels.Channel

    @valid_creds %{"a field" => "a value", "endpoint" => "http://test.com/api"}
    @updated_creds %{"a field" => "a value", "another field" => "another value", "endpoint" => "http://test.com/api"}
    @valid_attrs %{"active" => true, "credentials" => @valid_creds, "name" => "some name", "type" => "http", "type_name" => "HTTP"}
    @update_attrs %{"active" => false, "credentials" => @updated_creds, "name" => "some updated name", "type" => "mqtt", "type_name" => "MQTT"}
    @invalid_attrs %{"active" => nil, "credentials" => nil, "name" => nil, "type" => nil}

    def channel_fixture(attrs \\ %{}) do
      organization = insert(:organization)
      attrs = attrs
      |> Enum.into(@valid_attrs)
      |> Enum.into(%{ "organization_id" => organization.id})

      {:ok, channel} = Channels.create_channel(organization, attrs)
      { channel, organization }
    end

    test "list_channels/0 returns all channels" do
      { channel, _ } = channel_fixture()
      assert Channels.list_channels() == [channel]
    end

    test "get_channel!/1 returns the channel with given id" do
      { channel, _ } = channel_fixture()
      assert Channels.get_channel!(channel.id) == channel
    end

    test "create_channel/1 with valid data creates a channel" do
      organization = insert(:organization)
      attrs = @valid_attrs |> Enum.into(%{"organization_id" => organization.id})
      assert {:ok, %Channel{} = channel} = Channels.create_channel(organization, attrs)
      assert channel.active == true
      assert channel.credentials["a field"] == @valid_creds["a field"]
      assert channel.name == "some name"
      assert channel.type == "http"
      assert channel.organization_id == organization.id
    end

    test "create_channel/1 with invalid data returns error changeset" do
      organization = insert(:organization)
      assert {:error, %Ecto.Changeset{}} = Channels.create_channel(organization, @invalid_attrs)
    end

    test "update_channel/2 with valid data updates the channel" do
      { channel, organization } = channel_fixture()
      assert {:ok, channel} = Channels.update_channel(channel, organization, @update_attrs)
      assert %Channel{} = channel
      assert channel.active == false
      assert channel.credentials["endpoint"] == @updated_creds["endpoint"]
      assert channel.name == "some updated name"
    end

    test "update_channel/2 with invalid data returns error changeset" do
      { channel, organization } = channel_fixture()
      assert {:error, %Ecto.Changeset{}} = Channels.update_channel(channel, organization, @invalid_attrs)
      assert channel == Channels.get_channel!(channel.id)
    end

    test "delete_channel/1 deletes the channel" do
      { channel, organization } = channel_fixture()
      assert {:ok, %Channel{}} = Channels.delete_channel(channel)
      assert_raise Ecto.NoResultsError, fn -> Channels.get_channel!(channel.id) end
    end
  end
end
