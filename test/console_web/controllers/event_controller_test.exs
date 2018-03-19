defmodule ConsoleWeb.EventControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Events
  alias Console.Events.Event

  import Console.AuthHelper

  @create_attrs %{description: "some description", direction: "some direction", payload: "some payload", payload_size: 42, reported_at: ~N[2010-04-17 14:00:00.000000], rssi: 120.5, signal_strength: 42, status: "some status"}
  @update_attrs %{description: "some updated description", direction: "some updated direction", payload: "some updated payload", payload_size: 43, reported_at: ~N[2011-05-18 15:01:01.000000], rssi: 456.7, signal_strength: 43, status: "some updated status"}
  @invalid_attrs %{description: nil, direction: nil, payload: nil, payload_size: nil, reported_at: nil, rssi: nil, signal_strength: nil, status: nil}

  def fixture(:event) do
    {:ok, event} = Events.create_event(@create_attrs)
    event
  end

  describe "index" do
    setup [:authenticate_user]

    test "lists all events", %{conn: conn} do
      conn = get conn, event_path(conn, :index)
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create event" do
    setup [:authenticate_user]

    test "renders event when data is valid", %{conn: conn} do
      conn = post conn, event_path(conn, :create), event: @create_attrs
      %{"id" => id} = json_response(conn, 201)["data"]

      assert json_response(conn, 201)["data"] == %{
        "id" => id,
        "description" => "some description",
        "direction" => "some direction",
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
      assert json_response(conn, 200)["data"] == %{
        "id" => id,
        "description" => "some updated description",
        "direction" => "some updated direction",
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
