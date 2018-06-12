defmodule Console.Notifications.NotificationResolver do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Notifications.Notification

  def paginate(%{active: active, page: page, page_size: page_size}, %{context: %{current_team: current_team, current_membership: current_membership}}) do
    notifications =
      Ecto.assoc(current_team, :notifications)
      |> Notification.active(current_membership)
      |> order_by([desc: :inserted_at])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, notifications}
  end

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team, current_membership: current_membership}}) do
    notifications =
      Ecto.assoc(current_team, :notifications)
      |> Notification.with_active(current_membership)
      |> order_by([desc: :inserted_at])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, notifications}
  end
end
