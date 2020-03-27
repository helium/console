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

  def create_event(attrs \\ %{}) do
    reported_at_naive =
      attrs["reported_at"]
      |> DateTime.from_unix!()
      |> DateTime.to_naive()
    reported_at = Integer.to_string(attrs["reported_at"])

    hotspots = Jason.decode!(attrs["hotspots"])
    # channels = Jason.decode!(attrs["channels"]) swap out below during phase 2 router
    channels = [%{
      "name" => attrs["channel_name"],
      "id" => attrs["channel_id"],
      "description" => attrs["description"],
      "status" => attrs["status"]
    }]
    # remove useless attrs on event.ex after phase 2

    attrs = Map.merge(attrs, %{
      "reported_at_naive" => reported_at_naive,
      "reported_at" => reported_at,
      "hotspots" => hotspots,
      "channels" => channels
    })

    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
  end
end
