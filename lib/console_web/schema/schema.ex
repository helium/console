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
    field :dev_eui, :string
    field :oui, :integer
    field :organization_id, :id
    field :organization, :organization
    field :inserted_at, :naive_datetime
    field :labels, list_of(:label)
    field :channels, list_of(:channel)
  end

  paginated object :label do
    field :id, :id
    field :name, :string
    field :color, :string
    field :inserted_at, :naive_datetime
    field :devices, list_of(:device)
  end

  paginated object :channel do
    field :id, :id
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :endpoint, :string
    field :method, :string
    field :headers, :string
    field :inbound_token, :string
    field :active, :boolean
    field :default, :boolean
    field :show_dupes, :boolean
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

  object :organization do
    field :id, :id
    field :name, :string
    field :inserted_at, :naive_datetime
  end

  object :event do
    field :id, :id
    field :payload_size, :integer
    field :rssi, :string
    field :snr, :string
    field :reported_at, :string
    field :delivered_at, :string
    field :status, :string
    field :description, :string
    field :channel_name, :string
    field :hotspot_name, :string
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

    @desc "Get paginated devices for specified label ID"
    paginated field :devices_by_label, :paginated_devices do
      arg :label_id, non_null(:id)
      resolve(&Console.Devices.DeviceResolver.paginate_by_label/2)
    end

    @desc "Get a single device"
    field :device, :device do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.find/2
    end

    field :all_devices, list_of(:device) do
      resolve &Console.Devices.DeviceResolver.all/2
    end

    @desc "Get paginated labels"
    paginated field :labels, :paginated_labels do
      resolve(&Console.Labels.LabelResolver.paginate/2)
    end

    @desc "Get a single label"
    field :label, :label do
      arg :id, non_null(:id)
      resolve &Console.Labels.LabelResolver.find/2
    end

    field :all_labels, list_of(:label) do
      resolve &Console.Labels.LabelResolver.all/2
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
      resolve(&Console.Organizations.MembershipResolver.paginate/2)
    end

    @desc "Get paginated invitations"
    paginated field :invitations, :paginated_invitations do
      resolve(&Console.Organizations.InvitationResolver.paginate/2)
    end

    @desc "Get a single organization"
    field :organization, :organization do
      arg :id, non_null(:id)
      resolve(&Console.Organizations.OrganizationResolver.find/2)
    end

    @desc "Get all organizations"
    field :organizations, list_of(:organization) do
      resolve(&Console.Organizations.OrganizationResolver.all/2)
    end

    @desc "Search for devices, gateways and channels"
    field :search_results, list_of(:search_result) do
      arg :query, :string
      resolve &Console.Search.SearchResolver.search/2
    end

    @desc "Search for devices"
    field :search_devices, list_of(:device) do
      arg :query, :string
      resolve &Console.Search.SearchResolver.search_devices/2
    end

    @desc "Search for labels"
    field :search_labels, list_of(:label) do
      arg :query, :string
      resolve &Console.Search.SearchResolver.search_labels/2
    end
  end

  subscription do
    field :organization_updated, :organization do
      arg :user_id, :string

      config fn args, _ ->
        {:ok, topic: "#{args.user_id}/organization_updated"}
      end
    end

    field :event_added, :event do
      arg :context_id, :string
      arg :context_name, :string

      config fn args, _ ->
        {:ok, topic: "#{args.context_name}/#{args.context_id}"}
      end
    end

    field :label_added, :label do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/label_added"}
      end
    end

    field :label_updated, :label do
      arg :id, :string

      config fn args, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/#{args.id}/label_updated"}
      end
    end

    field :device_added, :device do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/device_added"}
      end
    end

    field :device_updated, :device do
      arg :device_id, :string

      config fn args, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/#{args.device_id}/device_updated"}
      end
    end

    field :gateway_added, :gateway do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/gateway_added"}
      end
    end

    field :channel_added, :channel do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/channel_added"}
      end
    end

    field :channel_updated, :channel do
      arg :channel_id, :string

      config fn args, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/#{args.channel_id}/channel_updated"}
      end
    end

    field :membership_updated, :membership do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/membership_updated"}
      end
    end

    field :invitation_updated, :invitation do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/invitation_updated"}
      end
    end
  end
end
