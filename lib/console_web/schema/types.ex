defmodule ConsoleWeb.Schema.Types do
  use Absinthe.Schema.Notation
  import_types Absinthe.Type.Custom

  object :item do
    field :id, :id
    field :name, :string
  end

  object :device do
    field :id, :id
    field :name, :string
    field :mac, :string
  end

  object :event do
    field :id, :id
    field :description, :string
    field :size, :integer
    field :rssi, :float
    field :reported_at, :datetime
    field :status, :string
  end
end
