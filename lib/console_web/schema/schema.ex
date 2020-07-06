defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use ConsoleWeb.Schema.Paginated
  import_types Absinthe.Type.Custom

  paginated object :device do
    field :id, :id
    field :name, :string
    field :dev_eui, :string
    field :app_eui, :string
    field :app_key, :string
    field :oui, :integer
    field :frame_up, :integer
    field :frame_down, :integer
    field :organization_id, :id
    field :organization, :organization
    field :inserted_at, :naive_datetime
    field :last_connected, :naive_datetime
    field :labels, list_of(:label)
    field :channels, list_of(:channel)
    field :total_packets, :integer
    field :packets_last_1d, :integer
    field :packets_last_7d, :integer
    field :packets_last_30d, :integer
  end

  paginated object :label do
    field :id, :id
    field :name, :string
    field :color, :string
    field :creator, :string
    field :inserted_at, :naive_datetime
    field :devices, list_of(:device)
    field :channels, list_of(:channel)
    field :function, :function
    field :device_count, :integer
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
    field :aws_region, :string
    field :topic, :string
    field :active, :boolean
    field :labels, list_of(:label)
    field :devices, list_of(:device)
    field :device_count, :integer
    field :downlink_token, :string
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

  paginated object :organization do
    field :id, :id
    field :name, :string
    field :inserted_at, :naive_datetime
    field :dc_balance, :integer
    field :dc_balance_nonce, :integer
    field :stripe_customer_id, :string
    field :default_payment_id, :string
    field :automatic_payment_method, :string
    field :automatic_charge_amount, :integer
  end

  object :api_key do
    field :id, :id
    field :name, :string
    field :role, :string
    field :inserted_at, :naive_datetime
    field :user, :string
    field :active, :boolean
  end

  paginated object :dc_purchase do
    field :id, :id
    field :dc_purchased, :integer
    field :cost, :integer
    field :user_id, :string
    field :card_type, :string
    field :last_4, :string
  end

  paginated object :function do
    field :id, :id
    field :name, :string
    field :body, :string
    field :type, :string
    field :format, :string
    field :active, :boolean
    field :labels, list_of(:label)
  end

  object :event do
    field :id, :id
    field :device_id, :id
    field :description, :string
    field :payload_size, :integer
    field :port, :integer
    field :devaddr, :string
    field :category, :string
    field :frame_up, :integer
    field :frame_down, :integer
    field :hotspots, list_of(:event_hotspot)
    field :channels, list_of(:event_channel)
    field :reported_at, :string
    field :reported_at_naive, :naive_datetime
    field :device_name, :string
    field :payload, :string
  end

  object :event_hotspot do
    field :id, :string
    field :name, :string
    field :rssi, :float
    field :snr, :float
    field :frequency, :float
    field :spreading, :string
  end

  object :event_channel do
    field :id, :string
    field :name, :string
    field :status, :string
    field :description, :string
    field :debug, :string
  end

  object :search_result do
    field :id, :id
    field :title, :string
    field :description, :string
    field :url, :string
    field :category, :string
    field :score, :float
  end

  paginated object :device_import do
    field :id, :id
    field :user_id, :string
    field :successful_devices, :integer
    field :status, :string
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

    @desc "Get device import jobs"
    paginated field :device_imports, :paginated_device_imports do
      resolve(&Console.Devices.DeviceResolver.paginate_device_imports/2)
    end

    field :device_events, list_of(:event) do
      arg :device_id, non_null(:id)

      resolve &Console.Devices.DeviceResolver.events/2
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

    field :all_channels, list_of(:channel) do
      resolve &Console.Channels.ChannelResolver.all/2
    end

    field :all_functions, list_of(:function) do
      resolve &Console.Functions.FunctionResolver.all/2
    end

    @desc "Get paginated memberships"
    paginated field :memberships, :paginated_memberships do
      resolve(&Console.Organizations.MembershipResolver.paginate/2)
    end

    @desc "Get paginated invitations"
    paginated field :invitations, :paginated_invitations do
      resolve(&Console.Organizations.InvitationResolver.paginate/2)
    end

    @desc "Get all organizations"
    paginated field :organizations, :paginated_organizations do
      resolve(&Console.Organizations.OrganizationResolver.paginate/2)
    end

    @desc "Get a single organization"
    field :organization, :organization do
      arg :id, non_null(:id)
      resolve(&Console.Organizations.OrganizationResolver.find/2)
    end

    field :all_organizations, list_of(:organization) do
      resolve &Console.Organizations.OrganizationResolver.all/2
    end

    @desc "Search for devices and channels"
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

    field :api_keys, list_of(:api_key) do
      resolve &Console.ApiKeys.ApiKeyResolver.all/2
    end

    @desc "Get paginated functions"
    paginated field :functions, :paginated_functions do
      resolve(&Console.Functions.FunctionResolver.paginate/2)
    end

    @desc "Get a single function"
    field :function, :function do
      arg :id, non_null(:id)
      resolve &Console.Functions.FunctionResolver.find/2
    end

    paginated field :dc_purchases, :paginated_dc_purchases do
      resolve(&Console.DcPurchases.DcPurchaseResolver.paginate/2)
    end
  end

  subscription do
    field :organization_added, :organization do
      config fn _, %{context: %{ current_user_id: user_id }} ->
        {:ok, topic: "#{user_id}/organization_added"}
      end
    end

    field :organization_updated, :organization do
      arg :organization_id, :string

      config fn args, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/organization_updated"}
      end
    end

    field :event_added, :event do
      arg :device_id, :string

      config fn args, _ ->
        {:ok, topic: "devices/#{args.device_id}/event"}
      end
    end

    field :label_debug_event_added, :event do
      arg :label_id, :string

      config fn args, _ ->
        {:ok, topic: "labels/#{args.label_id}/event"}
      end
    end

    field :label_added, :label do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/label_added"}
      end
    end

    field :label_added_for_nav, :label do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/label_added_for_nav"}
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

    field :import_added, :device_import do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/import_added"}
      end
    end

    field :import_updated, :device_import do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/import_updated"}
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

    field :api_key_added, :api_key do
      config fn _, %{context: %{ current_organization_id: organization_id, current_user_id: user_id }} ->
        {:ok, topic: "#{organization_id}/api_key_added"}
      end
    end

    field :function_added, :function do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/function_added"}
      end
    end

    field :function_updated, :function do
      arg :function_id, :string

      config fn args, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/#{args.function_id}/function_updated"}
      end
    end

    field :dc_purchase_added, :dc_purchase do
      config fn _, %{context: %{ current_organization_id: organization_id }} ->
        {:ok, topic: "#{organization_id}/dc_purchase_added"}
      end
    end
  end
end
