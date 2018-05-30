defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :modern
  use Absinthe.Schema.Notation
  use ConsoleWeb.Schema.Paginated
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

  # creates 2 obects: :paginated_event and :paginated_events
  paginated object :event do
    field :id, :id
    field :description, :string
    field :payload_size, :integer
    field :rssi, :float
    field :reported_at, :naive_datetime
    field :status, :string
  end

  paginated object :audit_trail do
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

  node object :gateway do
    field :id, :id
    field :_id, :string, resolve: &internal_id/2
    field :name, :string
    field :mac, :string
    field :longitude, :decimal
    field :latitude, :decimal
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

    @desc "Get a single gateway"
    field :gateway, :gateway do
      arg :id, non_null(:id)
      resolve &Console.Gateways.GatewayResolver.find/2
    end

    @desc "Get paginated events"
    paginated field :events, :paginated_events do
      arg :context_id, :string
      arg :context_name, :string
      resolve &Console.Events.EventResolver.paginate/2
    end

    @desc "Get all audit trails"
    paginated field :audit_trails, :paginated_audit_trails do
      arg :user_id, :string
      resolve(&Console.Devices.AuditResolver.paginate/2)
    end
  end

  subscription do
    field :event_added, :event do
      arg :device_id, :string

      config fn args, _ ->
        {:ok, topic: args.device_id}
      end
    end
  end
end
