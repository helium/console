defmodule Console.Teams.MembershipResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    memberships =
      Ecto.assoc(current_team, [:memberships])
      |> Repo.paginate(page: page, page_size: page_size)

    entries = memberships.entries |> Repo.preload([user: [:twofactor]])
    result = Map.merge(memberships, %{ entries: entries })
    {:ok, result}
  end

  def user_email(_, %{source: source}), do: {:ok, source.user.email}

  def two_factor(_, %{source: source}), do: {:ok, source.user.twofactor != nil}
end
