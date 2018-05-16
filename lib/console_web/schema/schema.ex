defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  use Absinthe.Schema.Notation
  import_types Absinthe.Type.Custom

  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Events
  alias Console.Events.Event
  alias Absinthe.Relay.Connection

  node interface do
    resolve_type fn
      %Console.Devices.Device{}, _ ->
        :device
      %Console.Events.Event{}, _ ->
        :event
      _, _ ->
        nil
    end
  end

  connection(node_type: :event)

  node object :event do
    field :id, :id
    field :description, :string
    field :payload_size, :integer
    field :rssi, :float
    field :reported_at, :naive_datetime
    field :status, :string
  end

  node object :device do
    field :id, :id
    field :name, :string
    field :mac, :string
    connection field :events, node_type: :event do
      resolve fn
        pagination_args, %{source: device} ->
          # TODO: move to a resolver module
          Event
          |> where(device_id: ^device.id)
          |> order_by([desc: :reported_at])
          |> Connection.from_query(&Repo.all/1, pagination_args)
      end
    end
  end

  query do
    @desc "Get all devices"
    field :devices, list_of(:device) do
      resolve(&Console.Devices.DeviceResolver.all/2)
    end

    @desc "Get a single device"
    field :device, :device do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.find/2
    end
  end
end
