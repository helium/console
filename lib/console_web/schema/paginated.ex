defmodule ConsoleWeb.Schema.Paginated do
  defmacro __using__(_opts) do
    quote do
      import ConsoleWeb.Schema.Paginated
    end
  end

  defmacro paginated({:object, _, [identifier | rest]}, do: block) do
    node_id = String.to_atom("paginated_#{Atom.to_string(identifier)}")
    collection_id = String.to_atom("#{Atom.to_string(node_id)}s")

    quote do
      unquote do
        Absinthe.Relay.Node.Notation.record_object!(env, node_id, attrs, block)
      end

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
      field :events, :paginated_events, do: unquote(field_block(block))
    end
  end

  defp field_block({:__block__, _, body}) do
    {:__block__, _, pagination_args} =
      quote do
      arg :page, :integer
      arg :page_size, :integer
    end

    {:__block__, [], pagination_args ++ body}
  end
end
