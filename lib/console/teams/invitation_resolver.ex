defmodule Console.Teams.InvitationResolver do
  alias Console.Repo
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    invitations =
      Ecto.assoc(current_team, [:invitations])
      |> where([i], i.pending == true)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, invitations}
  end
end
