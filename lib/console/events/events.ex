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

  def get_device_last_event(device_id) do
    Event
      |> where([e], e.device_id == ^device_id)
      |> limit(1)
      |> order_by(desc: :reported_at_naive)
      |> Repo.one()
  end

  def get_device_last_events(device_id, count) do
    Event
      |> where([e], e.device_id == ^device_id)
      |> limit(^count)
      |> order_by(desc: :reported_at_naive)
      |> Repo.all()
  end

  def get_device_last_events(device_id, count, sub_category) do
    Event
      |> where([e], e.device_id == ^device_id and e.sub_category == ^sub_category)
      |> limit(^count)
      |> order_by(desc: :reported_at_naive)
      |> Repo.all()
  end

  def get_events_since_last_stat_run(epoch) do
    Event
      |> where([e], e.reported_at_epoch >= ^epoch)
      |> order_by(desc: :reported_at_epoch)
      |> Repo.all()
  end

  def create_event(attrs \\ %{}) do
    reported_at_naive =
      attrs["reported_at"]
      |> DateTime.from_unix!(:millisecond)
      |> DateTime.to_naive()
    reported_at = Integer.to_string(attrs["reported_at"])

    attrs = Map.merge(attrs, %{
      "reported_at_naive" => reported_at_naive,
      "reported_at" => reported_at
    })

    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
  end
end
