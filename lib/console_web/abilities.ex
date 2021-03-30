defmodule ConsoleWeb.Abilities do
  alias Console.Organizations.Membership

  def can?(%Membership{role: "admin"}, _action, _controller) do
    true
  end

  def can?(%Membership{role: "manager"}, action, controller) do
    cond do
      controller == ConsoleWeb.DataCreditController -> false
      controller == ConsoleWeb.ApiKeyController -> false
      controller == ConsoleWeb.InvitationController and action in [:create, :delete] -> false
      controller == ConsoleWeb.MembershipController and action in [:update, :delete] -> false
      true -> true
    end
  end

  def can?(%Membership{role: "read"}, action, controller) do
    cond do
      controller == ConsoleWeb.DeviceController and action in [:debug] -> true
      controller == ConsoleWeb.LabelController and action in [:debug] -> true
      true -> false
    end
  end

  def can?(_membership, _action, _controller), do: false
end
