defmodule Console.Organizations.MembershipResolver do
  alias Console.Repo
  alias Console.Organizations.Membership

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    memberships =
      Ecto.assoc(current_organization, :memberships)
      |> Membership.user_twofactor
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, memberships}
  end
end
