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
    attrs =
      case attrs["reported_at"] do
        nil -> attrs
        _ ->
          reported_at_naive =
            attrs["reported_at"]
            |> String.to_integer()
            |> DateTime.from_unix!()
            |> DateTime.to_naive()

          Map.merge(attrs, %{"reported_at_naive" => reported_at_naive})
      end

    %Event{}
    |> Event.changeset(attrs)
    |> Repo.insert()
  end
end
