defmodule Console.Events do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Events.Event

  def list_events do
    Repo.all(Event)
  end

  def list_events(%{"device_id" => device_id}) do
    query = from e in Event, where: e.device_id == ^device_id
    Repo.all(query)
  end

  def list_events(_), do: list_events()

  def get_event!(id), do: Repo.get!(Event, id)

  def last do
    from(e in Event, order_by: [desc: e.inserted_at]) |> Repo.one()
  end

  def fetch_assoc(%Event{} = event) do
    Repo.preload(event, [:device, :gateway, :channel])
  end

  def create_event(attrs \\ %{}) do
    attrs =
      case (attrs["reported_at"]) != nil do
        true -> Map.merge(attrs, %{"reported_at" => NaiveDateTime.from_iso8601!(attrs["reported_at"])})
        false -> attrs
      end

    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
  end

  def update_event(%Event{} = event, attrs) do
    attrs =
      case (attrs["reported_at"]) != nil do
        true -> Map.merge(attrs, %{"reported_at" => NaiveDateTime.from_iso8601!(attrs["reported_at"])})
        false -> attrs
      end

    event
    |> Event.changeset(attrs)
    |> Repo.update()
  end

  def delete_event(%Event{} = event) do
    Repo.delete(event)
  end

  def change_event(%Event{} = event) do
    Event.changeset(event, %{})
  end
end
