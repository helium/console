defmodule ConsoleWeb.EventController do
  use ConsoleWeb, :controller

  alias Console.Events
  alias Console.Events.Event

  plug ConsoleWeb.Plug.AuthorizeAction when action not in [:create]

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, params) do
    events = Events.list_events(params)
    render(conn, "index.json", events: events)
  end

  def create(conn, %{"event" => event_params}) do
    IO.inspect event_params
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

  defp broadcast(%Event{} = event, _) do
    event = Events.fetch_assoc(event)

    if event.device do
      Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: "devices/#{event.device.id}")
    end
    if event.gateway do
      Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: "gateways/#{event.gateway.id}")
    end
    if event.channel do
      Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: "channels/#{event.channel.id}")
    end
    if event.team_id do
      Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, demo_event_added: "#{event.team_id}/demo_event_added")
    end
  end
end
