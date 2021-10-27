defmodule Console.EventsStatRuns.EventsStatRun do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events_stat_runs" do
    field :last_event_id, :string
    field :reported_at_epoch, :integer

    timestamps()
  end

  def changeset(run, attrs) do
    run
    |> cast(attrs, [
      :last_event_id,
      :reported_at_epoch,
    ])
  end
end
