defmodule ConsoleWeb.Abilities do
  alias Console.Organizations.Membership

  def can?(%Membership{role: "admin"}, action, controller) do
    true
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
