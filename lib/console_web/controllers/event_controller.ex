defmodule ConsoleWeb.EventController do
  use ConsoleWeb, :controller

  alias Console.Events
  alias Console.Events.Event

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, params) do
    events = Events.list_events(params)
    render(conn, "index.json", events: events)
  end

  def create(conn, %{"event" => event_params}) do
    with {:ok, %Event{} = event} <- Events.create_event(event_params) do
      event = Events.fetch_assoc(event)
      broadcast(event, "new")

      conn
      |> put_status(:created)
      |> put_resp_header("location", event_path(conn, :show, event))
      |> render("show.json", event: event)
    end
  end

  def show(conn, %{"id" => id}) do
    event = Events.get_event!(id) |> Events.fetch_assoc()
    render(conn, "show.json", event: event)
  end

  def update(conn, %{"id" => id, "event" => event_params}) do
    event = Events.get_event!(id) |> Events.fetch_assoc()

    with {:ok, %Event{} = event} <- Events.update_event(event, event_params) do
      render(conn, "show.json", event: event)
    end
  end

  def delete(conn, %{"id" => id}) do
    event = Events.get_event!(id)

    with {:ok, %Event{}} <- Events.delete_event(event) do
      broadcast(event, "delete")
      send_resp(conn, :no_content, "")
    end
  end

  defp broadcast(%Event{} = event, action) do
    event = Events.fetch_assoc(event)

    device_team_id = if event.device, do: event.device.team_id
    gateway_team_id = if event.gateway, do: event.gateway.team_id
    channel_team_id = if event.channel, do: event.channel.team_id

    team_ids =
      [device_team_id, gateway_team_id, channel_team_id]
      |> Enum.reject(&is_nil/1)
      |> Enum.uniq()

    body = ConsoleWeb.EventView.render("show.json", event: event)

    Enum.each(team_ids, fn team_id ->
      ConsoleWeb.Endpoint.broadcast("event:#{team_id}", action, body)
    end)

    if event.device do
      Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: event.device.id)
    end
  end
end
