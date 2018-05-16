defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  use Absinthe.Schema.Notation
  import_types Absinthe.Type.Custom

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

  connection(node_type: :group)
  node object :group do
    field :id, :id
    field :name, :string
  end

  node object :device do
    field :id, :id
    field :name, :string
    field :mac, :string
    connection field :events, node_type: :event do
      resolve &Console.Events.EventResolver.connection/2
    end
    connection field :groups, node_type: :group do
      resolve &Console.Groups.GroupResolver.connection/2
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
