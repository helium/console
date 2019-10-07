defmodule Console.Events.EventResolver do
  import Ecto.Query, warn: false

  alias Console.Repo

  def recent(%{context_id: context_id, context_name: context_name}, %{context: %{current_team: current_team}}) do
    resource = Ecto.assoc(current_team, String.to_atom(context_name)) |> Repo.get!(context_id)
    cutoff_time = NaiveDateTime.add(NaiveDateTime.utc_now(), -300, :second)

    events =
      Ecto.assoc(resource, :events)
      |> where([e], e.inserted_at > ^cutoff_time)
      |> order_by([desc: :reported_at])
      |> Repo.all()
    {:ok, events}
  end
end
