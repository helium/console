defmodule Console.Notifications do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Notifications.Notification
  alias Console.Teams.Team

  def create_notifications(team = %Team{}, attrs \\ %{}) do
    memberships = Ecto.assoc(team, :memberships) |> Repo.all()
    now = DateTime.utc_now()
    entries =
      for m <- memberships,
          do:
            Map.merge(attrs, %{
              "membership_id" => m.id,
              "inserted_at" => now,
              "updated_at" => now
            })
            |> Map.new(fn {k, v} -> {String.to_atom(k), v} end)

    Repo.insert_all(Notification, entries)
  end
end
