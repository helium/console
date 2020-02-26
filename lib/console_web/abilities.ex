defmodule ConsoleWeb.Abilities do
  alias Console.Organizations.Membership

  def can?(%Membership{role: "admin"}, action, controller) do
    true
  end

  def can?(%Membership{role: "manager"}, action, controller) do
    # cond do
    #   controller == ConsoleWeb.DeviceController and action in [:create, :update, :delete] -> false
    #   controller == ConsoleWeb.InvitationController and action in [:create, :delete] -> false
    #   controller == ConsoleWeb.MembershipController and action in [:update, :delete] -> false
    #   controller == ConsoleWeb.OrganizationController and action in [:delete_organization] -> false
    #   true -> true
    # end
    true
  end

  def can?(_membership, _action, _controller), do: false
end
