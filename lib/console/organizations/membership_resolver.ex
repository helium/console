defmodule Console.Organizations.MembershipResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    memberships =
      Ecto.assoc(current_organization, :memberships)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, memberships}
  end
end
