defmodule Console.Notifications.NotificationResolver do
  import Ecto.Query, warn: false
  alias Console.Repo

  def paginate(%{active: active, page: page, page_size: page_size}, %{context: %{current_membership: current_membership}}) do
    notifications =
      Ecto.assoc(current_membership, :notifications)
      |> order_by([desc: :inserted_at])
      |> where(active: ^active)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, notifications}
  end

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_membership: current_membership}}) do
    notifications =
      Ecto.assoc(current_membership, :notifications)
      |> order_by([desc: :inserted_at])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, notifications}
  end
end
