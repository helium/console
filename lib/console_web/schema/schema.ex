defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use ConsoleWeb.Schema.Paginated
  import_types Absinthe.Type.Custom

  paginated object :device do
    field :id, :id
    field :seq_id, :integer
    field :name, :string
    field :key, :string
    field :mac, :string
    field :oui, :integer
    field :team_id, :id
    field :team, :team
    field :inserted_at, :naive_datetime
    field :channels, list_of(:channel)
  end

  paginated object :channel do
    field :id, :id
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :endpoint, :string
    field :method, :string
    field :inbound_token, :string
    field :active, :boolean
    field :default, :boolean
    field :devices, list_of(:device)
  end

  paginated object :gateway do
    field :id, :id
    field :name, :string
    field :mac, :string
    field :location, :string
    field :longitude, :decimal
    field :latitude, :decimal
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

  paginated object :membership do
    field :id, :id
    field :email, :string
    field :two_factor_enabled, :boolean
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

  object :organization do
    field :id, :id
    field :name, :string
    field :inserted_at, :naive_datetime
    field :teams, list_of(:team) do
      resolve &Console.Teams.OrganizationResolver.get_teams/2
    end
  end

  object :event do
    field :id, :id
    field :payload_size, :integer
    field :rssi, :string
    field :reported_at, :string
    field :delivered_at, :string
    field :status, :string
    field :channel_name, :string
    field :hotspot_name, :string
  end

  object :team do
    field :id, :id
    field :name, :string
    field :inserted_at, :naive_datetime
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

    @desc "Get all channels under current organization"
    field :organization_channels, list_of(:channel) do
      resolve &Console.Channels.ChannelResolver.all/2
    end

    @desc "Get a single channel"
    field :channel, :channel do
      arg :id, non_null(:id)
      resolve &Console.Channels.ChannelResolver.find/2
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

    @desc "Get all organizations"
    field :organizations, list_of(:organization) do
      resolve(&Console.Teams.OrganizationResolver.all/2)
    end

    @desc "Search for devices, gateways and channels"
    field :search_results, list_of(:search_result) do
      arg :query, :string
      resolve &Console.Search.SearchResolver.search/2
    end
  end

  subscription do
    field :team_added, :team do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/team_added"}
      end
    end

    field :event_added, :event do
      arg :context_id, :string
      arg :context_name, :string

      config fn args, _ ->
        {:ok, topic: "#{args.context_name}/#{args.context_id}"}
      end
    end

    field :device_added, :device do
      config fn _, %{context: %{ current_team_id: team_id, current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/#{team_id}/device_added"}
      end
    end

    field :device_channel_added, :channel do
      arg :device_id, :string

      config fn args, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/#{args.device_id}/device_channel_added"}
      end
    end

    field :gateway_added, :gateway do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/gateway_added"}
      end
    end

    field :channel_added, :channel do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/channel_added"}
      end
    end

    field :membership_added, :membership do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/membership_added"}
      end
    end

    field :invitation_added, :invitation do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/invitation_added"}
      end
    end

    field :notification_update, :notification do
      config fn _, %{context: %{ current_team_id: team_id }} ->
        {:ok, topic: "#{team_id}/notification_update"}
      end
    end
  end
end
