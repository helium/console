defmodule Console.Notifications do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Notifications.Notification
  alias Console.Teams.Team
  alias Console.Teams.Membership

  def get_notification!(%Membership{} = membership, id) do
    Ecto.assoc(membership, :notifications) |> Repo.get!(id)
  end

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

  def update_notification(%Notification{} = notification, attrs \\ %{}) do
    notification
    |> Notification.changeset(attrs)
    |> Repo.update()
  end
end
