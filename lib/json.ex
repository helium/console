defmodule Console.Json do
  defmodule Type do
    @behaviour Ecto.Type
    alias Jsonexample.Json
 
    def type, do: :json

    def load({:ok, json}), do: {:ok, json}
    def load(value), do: load(Poison.decode(value))
    
    def dump(value), do: Poison.encode(value)
    
  end
end