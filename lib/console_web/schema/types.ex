defmodule ConsoleWeb.Schema.Types do
  use Absinthe.Schema.Notation
  import_types Absinthe.Type.Custom
  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias Console.Events

  object :device do
    field :id, :id
    field :name, :string
    field :mac, :string
    field :events, list_of(:event), resolve: dataloader(Events) do
      arg :count, :integer
    end
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
