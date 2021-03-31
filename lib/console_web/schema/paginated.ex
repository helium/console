defmodule ConsoleWeb.Schema.Paginated do
  defmacro __using__(_opts) do
    quote do
      import ConsoleWeb.Schema.Paginated
    end
  end

  defmacro paginated({:object, _, [identifier | _rest]}, do: block) do
    node_id = String.to_atom("#{Atom.to_string(identifier)}")
    collection_id = String.to_atom("paginated_#{Atom.to_string(node_id)}s")

    quote do
      object unquote(node_id), do: unquote(block)

      object unquote(collection_id) do
        field :entries, list_of(unquote(node_id))
        field :page_number, :integer
        field :page_size, :integer
        field :total_entries, :integer
        field :total_pages, :integer
      end
    end
  end

  defmacro paginated({:field, _, [identifier | rest]}, do: block) do
    quote do
      field unquote(identifier), unquote(List.first(rest)), do: unquote(field_block(block))
    end
  end

  defp field_block({:__block__, _, body}) do
    {:__block__, [], pagination_args() ++ body}
  end

  defp field_block(body) do
    body = List.flatten([body])
    {:__block__, [], pagination_args() ++ body}
  end

  defp pagination_args() do
    {:__block__, _, args} =
      quote do
        arg :page, :integer
        arg :page_size, :integer
      end

    args
  end
end
