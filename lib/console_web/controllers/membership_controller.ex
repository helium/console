defmodule ConsoleWeb.MembershipController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Membership

  action_fallback(ConsoleWeb.FallbackController)

  def delete(conn, %{"id" => id}) do
    membership = Teams.get_membership!(id)

    with {:ok, %Membership{}} <- Teams.delete_membership(membership) do
      send_resp(conn, :no_content, "")
    end
  end
end
