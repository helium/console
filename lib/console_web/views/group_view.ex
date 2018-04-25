defmodule ConsoleWeb.GroupView do
  use ConsoleWeb, :view

  def append_group_names(json, groups) do
    if Ecto.assoc_loaded?(groups) do
      group_names = for g <- groups, do: g.name
      Map.put(json, :groups, group_names)
    else
      json
    end
  end
end
