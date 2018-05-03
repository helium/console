defmodule ConsoleWeb.Abilities do
  alias Console.Teams.Membership

  def can?(%Membership{id: editor_id}, action, %Membership{id: editing_id})
      when editor_id == editing_id and action in [:update, :delete],
      do: false

  def can?(%Membership{role: "admin"}, _action, _item), do: true

  def can?(%Membership{role: "viewer"}, action, _item) when action in [:index, :show], do: true

  def can?(_membership, _action, _item), do: false
end
