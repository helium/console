defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use ConsoleWeb.Schema.Paginated
  import_types Absinthe.Type.Custom

  paginated object :device do
    field :id, :id
    field :name, :string
    field :mac, :string
    field :groups, list_of(:group) do
      resolve &Console.Groups.GroupResolver.find/2
    end
  end

  paginated object :channel do
    field :id, :id
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :active, :boolean
    field :groups, list_of(:group) do
      resolve &Console.Groups.GroupResolver.find/2
    end
  end

  paginated object :gateway do
    field :id, :id
    field :name, :string
    field :mac, :string
    field :location, :string
    field :longitude, :decimal
    field :latitude, :decimal
  end

  # creates 2 obects: :paginated_event and :paginated_events
  paginated object :event do
    field :id, :id
    field :description, :string
    field :payload_size, :integer
    field :rssi, :float
    field :reported_at, :naive_datetime
    field :status, :string
    field :direction, :string
  end

  paginated object :audit_trail do
    field :id, :id
    field :user_email, :string
    field :object, :string
    field :action, :string
    field :description, :string
    field :updated_at, :naive_datetime
  end

  paginated object :membership do
    field :id, :id
    field :email, :string, resolve: &Console.Teams.MembershipResolver.user_email/2
    field :role, :string
    field :inserted_at, :naive_datetime
  end

  paginated object :invitation do
    field :id, :id
    field :email, :string
    field :role, :string
    field :inserted_at, :naive_datetime
  end

  paginated object :notification do
    field :id, :id
    field :title, :string
    field :body, :string
    field :url, :string
    field :category, :string
    field :active, :boolean
    field :inserted_at, :naive_datetime
  end

  object :group do
    field :id, :id
    field :name, :string
  end

  object :search_result do
    field :id, :id
    field :title, :string
    field :description, :string
    field :url, :string
    field :category, :string
    field :score, :float
  end

  query do
    @desc "Get paginated devices"
    paginated field :devices, :paginated_devices do
      resolve(&Console.Devices.DeviceResolver.paginate/2)
    end

    @desc "Get a single device"
    field :device, :device do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.find/2
    end

    @desc "Get paginated gateways"
    paginated field :gateways, :paginated_gateways do
      resolve(&Console.Gateways.GatewayResolver.paginate/2)
    end

    @desc "Get a single gateway"
    field :gateway, :gateway do
      arg :id, non_null(:id)
      resolve &Console.Gateways.GatewayResolver.find/2
    end

    @desc "Get paginated channels"
    paginated field :channels, :paginated_channels do
      resolve(&Console.Channels.ChannelResolver.paginate/2)
    end

    @desc "Get a single channel"
    field :channel, :channel do
      arg :id, non_null(:id)
      resolve &Console.Channels.ChannelResolver.find/2
    end

    @desc "Get paginated events"
    paginated field :events, :paginated_events do
      arg :context_id, :string
      arg :context_name, :string
      resolve &Console.Events.EventResolver.paginate/2
    end

    @desc "Get paginated memberships"
    paginated field :memberships, :paginated_memberships do
      resolve(&Console.Teams.MembershipResolver.paginate/2)
    end

    @desc "Get paginated invitations"
    paginated field :invitations, :paginated_invitations do
      resolve(&Console.Teams.InvitationResolver.paginate/2)
    end

    @desc "Get paginated audit trails"
    paginated field :audit_trails, :paginated_audit_trails do
      arg :user_id, :string
      resolve(&Console.AuditTrails.AuditResolver.paginate/2)
    end

    @desc "Get paginated notifications"
    paginated field :notifications, :paginated_notifications do
      arg :active, :boolean
      resolve(&Console.Notifications.NotificationResolver.paginate/2)
    end

    @desc "Get recent events for a context (packet graph)"
    field :recent_events, list_of(:event) do
      arg :context_id, :string
      arg :context_name, :string
      resolve &Console.Events.EventResolver.recent/2
    end

    @desc "Search for devices, gateways and channels"
    field :search_results, list_of(:search_result) do
      arg :query, :string
      resolve &Console.Search.SearchResolver.search/2
    end
  end

  subscription do
    field :event_added, :event do
      arg :context_id, :string
      arg :context_name, :string

      config fn args, _ ->
        {:ok, topic: "#{args.context_name}/#{args.context_id}"}
      end
    end

    field :device_added, :device do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/device_added"}
      end
    end

    field :gateway_added, :gateway do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/gateway_added"}
      end
    end

    field :channel_added, :channel do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/channel_added"}
      end
    end

    field :membership_added, :membership do
      config fn what, test = %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/membership_added"}
      end
    end

    field :invitation_added, :invitation do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/invitation_added"}
      end
    end
  end
end
