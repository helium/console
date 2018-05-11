defmodule Console.Events do
  @moduledoc """
  The Events context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Events.Event

  @doc """
  Returns the list of events.

  ## Examples

      iex> list_events()
      [%Event{}, ...]

  """
  def list_events do
    Repo.all(Event)
  end

  def list_events(%{device_id: device_id}) do
    query = from e in Event, where: e.device_id == ^device_id
    Repo.all(query)
  end

  def list_events(%{"device_id" => device_id}) do
    query = from e in Event, where: e.device_id == ^device_id
    Repo.all(query)
  end

  def list_events(_), do: list_events()

  @doc """
  Gets a single event.

  Raises `Ecto.NoResultsError` if the Event does not exist.

  ## Examples

      iex> get_event!(123)
      %Event{}

      iex> get_event!(456)
      ** (Ecto.NoResultsError)

  """
  def get_event!(id), do: Repo.get!(Event, id)

  def last do
    from(e in Event, order_by: [desc: e.inserted_at]) |> Repo.one()
  end

  def fetch_assoc(%Event{} = event) do
    Repo.preload(event, [:device, :gateway, :channel])
  end

  @doc """
  Creates a event.

  ## Examples

      iex> create_event(%{field: value})
      {:ok, %Event{}}

      iex> create_event(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
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

  @doc """
  Updates a event.

  ## Examples

      iex> update_event(event, %{field: new_value})
      {:ok, %Event{}}

      iex> update_event(event, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
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

  @doc """
  Deletes a Event.

  ## Examples

      iex> delete_event(event)
      {:ok, %Event{}}

      iex> delete_event(event)
      {:error, %Ecto.Changeset{}}

  """
  def delete_event(%Event{} = event) do
    Repo.delete(event)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking event changes.

  ## Examples

      iex> change_event(event)
      %Ecto.Changeset{source: %Event{}}

  """
  def change_event(%Event{} = event) do
    Event.changeset(event, %{})
  end

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(Event, %{count: count}) do
    from Event, limit: ^count
  end

  def query(queryable, _params) do
    queryable
  end
end
