defmodule ConsoleWeb.Abilities do
  alias Console.Teams.Membership

  def can?(%Membership{role: "admin"}, _action, _item), do: true

  def can?(%Membership{role: "viewer"}, action, _item) when action in [:index, :show], do: true

  def can?(_membership, _action, _item), do: false
end
