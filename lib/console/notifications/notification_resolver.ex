defmodule Console.Notifications.NotificationResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_membership: current_membership}}) do
    notifications =
      Ecto.assoc(current_membership, :notifications)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, notifications}
  end
end
