defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  use Absinthe.Schema.Notation
  import_types Absinthe.Type.Custom

  def internal_id(_, %{source: source}), do: {:ok, source.id}

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
    field :_id, :string, resolve: &internal_id/2
    field :description, :string
    field :payload_size, :integer
    field :rssi, :float
    field :reported_at, :naive_datetime
    field :status, :string
  end

  # TODO turn this into a macro
  object :paginated_events do
    field :entries, list_of(:paginated_event)
    field :page_number, :integer
    field :page_size, :integer
    field :total_entries, :integer
    field :total_pages, :integer
  end

  object :paginated_event do
    field :id, :id
    field :description, :string
    field :payload_size, :integer
    field :rssi, :float
    field :reported_at, :naive_datetime
    field :status, :string
  end

  object :audit_trail do
    field :id, :id
    field :user_email, :string
    field :object, :string
    field :action, :string
    field :description, :string
    field :updated_at, :naive_datetime
  end

  connection(node_type: :group)
  node object :group do
    field :id, :id
    field :_id, :string, resolve: &internal_id/2
    field :name, :string
  end

  node object :device do
    field :id, :id
    field :_id, :string, resolve: &internal_id/2
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

    @desc "Get paginated events"
    field :events, :paginated_events do
      arg :device_id, :string
      arg :page, :integer
      arg :page_size, :integer
      resolve &Console.Events.EventResolver.paginate/2
    end

    @desc "Get all audit trails"
    field :audit_trails, list_of(:audit_trail) do
      resolve(&Console.Devices.AuditResolver.all/2)
    end
  end
end
