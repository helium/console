defmodule ConsoleWeb.EventControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Events
  alias Console.Events.Event

  import Console.FactoryHelper
  import Console.Factory

  @create_attrs %{description: "some description", direction: "inbound", payload: "some payload", payload_size: 42, reported_at: ~N[2010-04-17 14:00:00.000000], rssi: 120.5, signal_strength: 42, status: "some status"}
  @update_attrs %{description: "some updated description", direction: "outbound", payload: "some updated payload", payload_size: 43, reported_at: ~N[2011-05-18 15:01:01.000000], rssi: 456.7, signal_strength: 43, status: "some updated status"}
  @invalid_attrs %{description: nil, direction: "invalid direction", payload: nil, payload_size: nil, reported_at: nil, rssi: nil, signal_strength: nil, status: nil}

  def fixture(:event) do
    {:ok, event} = Events.create_event(@create_attrs)
    event
  end

  describe "index" do
    setup [:authenticate_user]

    test "lists all events", %{conn: conn} do
      {_, device_a_events} = create_device_with_events(5)
      {_, device_b_events} = create_device_with_events(5)
      device_a_event_ids = Enum.map(device_a_events, fn e -> e.id end)
      device_b_event_ids = Enum.map(device_b_events, fn e -> e.id end)

      conn = get conn, event_path(conn, :index)
      event_ids = Enum.map(json_response(conn, 200), fn e -> e["id"] end)
      assert Enum.all?(device_a_event_ids, fn e -> e in event_ids end)
      assert Enum.all?(device_b_event_ids, fn e -> e in event_ids end)
    end

    test "lists events for a single device", %{conn: conn} do
      {device_a, device_a_events} = create_device_with_events(5)
      {_device_b, device_b_events} = create_device_with_events(5)
      device_a_event_ids = Enum.map(device_a_events, fn e -> e.id end)
      device_b_event_ids = Enum.map(device_b_events, fn e -> e.id end)

      conn = get conn, event_path(conn, :index, device_id: device_a.id)
      event_ids = Enum.map(json_response(conn, 200), fn e -> e["id"] end)
      assert Enum.all?(device_a_event_ids, fn e -> e in event_ids end)
      refute Enum.all?(device_b_event_ids, fn e -> e in event_ids end)
    end
  end

  describe "create event" do
    setup [:authenticate_user]

    test "renders event when data is valid", %{conn: conn} do
      device = insert(:device)
      attrs = params_for(:event, device_id: device.id)
      conn = post conn, event_path(conn, :create), event: attrs
      %{"id" => id} = json_response(conn, 201)

      assert json_response(conn, 201) == %{
        "id" => id,
        "description" => "I am an event",
        "device" => %{
          "id" => device.id,
          "mac" => device.mac,
          "name" => device.name
        },
        "direction" => attrs.direction,
        "gateway" => nil,
        "channel" => nil,
        "payload" => "some payload",
        "payload_size" => 42,
        "reported_at" => "2010-04-17T14:00:00.000000",
        "rssi" => 120.5,
        "signal_strength" => 42,
        "status" => "some status"}
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, event_path(conn, :create), event: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update event" do
    setup [:authenticate_user, :create_event]

    test "renders event when data is valid", %{conn: conn, event: %Event{id: id} = event} do
      conn = put conn, event_path(conn, :update, event), event: @update_attrs
      assert json_response(conn, 200) == %{
        "id" => id,
        "description" => "some updated description",
        "device" => nil,
        "direction" => "outbound",
        "payload" => "some updated payload",
        "payload_size" => 43,
        "reported_at" => "2011-05-18T15:01:01.000000",
        "rssi" => 456.7,
        "signal_strength" => 43,
        "status" => "some updated status"}
    end

    test "renders errors when data is invalid", %{conn: conn, event: event} do
      conn = put conn, event_path(conn, :update, event), event: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete event" do
    setup [:authenticate_user, :create_event]

    test "deletes chosen event", %{conn: conn, event: event} do
      conn = delete conn, event_path(conn, :delete, event)
      assert response(conn, 204)
    end
  end

  defp create_event(_) do
    event = fixture(:event)
    {:ok, event: event}
  end
end
