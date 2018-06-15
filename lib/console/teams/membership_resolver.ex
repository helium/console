defmodule Console.Teams.MembershipResolver do
  alias Console.Repo
  alias Console.Teams.Membership

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    memberships =
      Ecto.assoc(current_team, :memberships)
      |> Membership.user_twofactor
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, memberships}
  end
end
