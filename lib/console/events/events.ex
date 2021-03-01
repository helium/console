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

  def create_event(attrs \\ %{}) do
    IO.inspect attrs
    reported_at_naive =
      attrs["reported_at"]
      |> DateTime.from_unix!()
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
