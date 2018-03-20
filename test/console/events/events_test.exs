defmodule Console.EventsTest do
  use Console.DataCase

  alias Console.Events

  import Console.Factory

  describe "events" do
    alias Console.Events.Event

    @valid_attrs %{description: "some description", direction: "inbound", payload: "some payload", payload_size: 42, reported_at: ~N[2010-04-17 14:00:00.000000], rssi: 120.5, signal_strength: 42, status: "some status"}
    @update_attrs %{description: "some updated description", direction: "outbound", payload: "some updated payload", payload_size: 43, reported_at: ~N[2011-05-18 15:01:01.000000], rssi: 456.7, signal_strength: 43, status: "some updated status"}
    @invalid_attrs %{description: nil, direction: "invalid direction", payload: nil, payload_size: nil, reported_at: nil, rssi: nil, signal_strength: nil, status: nil}

    def event_fixture(attrs \\ %{}) do
      {:ok, event} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Events.create_event()

      event
    end

    test "list_events/0 returns all events" do
      event = event_fixture()
      assert Events.list_events() == [event]
    end

    test "get_event!/1 returns the event with given id" do
      event = event_fixture()
      assert Events.get_event!(event.id) == event
    end

    test "create_event/1 with valid data creates a event" do
      assert {:ok, %Event{} = event} = Events.create_event(@valid_attrs)
      assert event.description == "some description"
      assert event.direction == "inbound"
      assert event.payload == "some payload"
      assert event.payload_size == 42
      assert event.reported_at == ~N[2010-04-17 14:00:00.000000]
      assert event.rssi == 120.5
      assert event.signal_strength == 42
      assert event.status == "some status"
    end

    test "create_event/1 with device, gateway and channel to associate" do
      device = insert(:device)
      gateway = insert(:gateway)
      channel = insert(:channel)
      attrs = params_for(:event, device: device, gateway: gateway, channel: channel)
      {:ok, event} = Events.create_event(attrs)
      event = Events.fetch_assoc(event)
      assert event.device.id == device.id
      assert event.gateway.id == gateway.id
      assert event.channel.id == channel.id
    end

    test "create_event/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Events.create_event(@invalid_attrs)
    end

    test "update_event/2 with valid data updates the event" do
      event = event_fixture()
      assert {:ok, event} = Events.update_event(event, @update_attrs)
      assert %Event{} = event
      assert event.description == "some updated description"
      assert event.direction == "outbound"
      assert event.payload == "some updated payload"
      assert event.payload_size == 43
      assert event.reported_at == ~N[2011-05-18 15:01:01.000000]
      assert event.rssi == 456.7
      assert event.signal_strength == 43
      assert event.status == "some updated status"
    end

    test "update_event/2 with invalid data returns error changeset" do
      event = event_fixture()
      assert {:error, %Ecto.Changeset{}} = Events.update_event(event, @invalid_attrs)
      assert event == Events.get_event!(event.id)
    end

    test "delete_event/1 deletes the event" do
      event = event_fixture()
      assert {:ok, %Event{}} = Events.delete_event(event)
      assert_raise Ecto.NoResultsError, fn -> Events.get_event!(event.id) end
    end

    test "change_event/1 returns a event changeset" do
      event = event_fixture()
      assert %Ecto.Changeset{} = Events.change_event(event)
    end
  end
end
