defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  use ConsoleWeb.Schema.Paginated
  import_types Absinthe.Type.Custom

  scalar :json, description: "JSON field type in postgres" do
    parse fn input ->
      case Poison.decode(input.value) do
        {:ok, result} -> {:ok, result}
        _ -> :error
      end
    end

    serialize &Poison.encode!/1
  end

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
    field :total_packets, :integer
    field :dc_usage, :integer
    field :active, :boolean
    field :adr_allowed, :boolean
    field :multi_buy_id, :id
    field :alerts, list_of(:alert)
    field :cf_list_enabled, :boolean
    field :in_xor_filter, :boolean
    field :updated_at, :naive_datetime
    field :config_profile_id, :id
    field :config_profile, :config_profile
  end

  paginated object :hotspot do
    field :hotspot_name, :string
    field :hotspot_address, :string
    field :status, :string
    field :long_city, :string
    field :packet_count, :integer
    field :packet_count_2d, :integer
    field :device_count, :integer
    field :device_count_2d, :integer
    field :short_country, :string
    field :short_state, :string
    field :most_heard_device_id, :string
    field :most_heard_device_name, :string
    field :most_heard_packet_count, :integer
    field :longitude, :decimal
    field :latitude, :decimal
    field :alias, :string
    field :avg_rssi, :float
    field :total_entries, :integer
  end

  object :hotspot_stats_device_count do
    field :count_1d, :integer
  end

  object :hotspot_packet do
    field :device_id, :string
    field :reported_at_epoch, :integer
  end

  object :hotspot_device_heard do
    field :device_id, :string
    field :device_name, :string
    field :packet_count, :integer
    field :reported_at, :naive_datetime
    field :total_entries, :integer
    field :rssi, :float
    field :snr, :float
  end

  object :organization_hotspot do
    field :hotspot_address, :string
    field :claimed, :boolean
    field :alias, :string
    field :organization_id, :id
  end

  object :device_stats do
    field :packets_last_1d, :integer
    field :packets_last_7d, :integer
    field :packets_last_30d, :integer
  end

  object :device_count do
    field :count, :integer
  end

  object :device_dc_stats do
    field :dc_last_1d, :integer
    field :dc_last_7d, :integer
    field :dc_last_30d, :integer
  end

  object :flow do
    field :id, :id
    field :organization_id, :id
    field :device_id, :id
    field :label_id, :id
    field :function_id, :id
    field :channel_id, :id
  end

  object :mqtt_topic do
    field :topic, :string
  end

  object :credentials do
    field :endpoint, :string
    field :uplink, :mqtt_topic
    field :downlink, :mqtt_topic
  end

  object :alert do
    field :id, :id
    field :name, :string
    field :last_triggered_at, :string
    field :node_type, :string
    field :config, :json
    field :organization_id, :id
  end

  object :multi_buy do
    field :id, :id
    field :name, :string
    field :value, :integer
  end

  object :config_profile do
    field :id, :id
    field :name, :string
    field :adr_allowed, :boolean
    field :cf_list_enabled, :boolean
  end

  paginated object :label do
    field :id, :id
    field :name, :string
    field :creator, :string
    field :inserted_at, :naive_datetime
    field :devices, list_of(:device)
    field :device_count, :integer
    field :adr_allowed, :boolean
    field :multi_buy_id, :id
    field :alerts, list_of(:alert)
    field :cf_list_enabled, :boolean
    field :updated_at, :naive_datetime
    field :config_profile_id, :id
  end

  paginated object :channel do
    field :id, :id
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :endpoint, :string
    field :method, :string
    field :headers, :string
    field :url_params, :string
    field :inbound_token, :string
    field :aws_region, :string
    field :aws_access_key, :string
    field :topic, :string
    field :active, :boolean
    field :downlink_token, :string
    field :credentials, type: :credentials
    field :payload_template, :string
    field :time_first_uplink, :naive_datetime
    field :updated_at, :naive_datetime
    field :alerts, list_of(:alert)
    field :number_devices, :integer
    field :receive_joins, :boolean
    field :azure_hub_name, :string
    field :azure_policy_name, :string
    field :azure_policy_key, :string
    field :last_errored, :boolean
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
    field :inactive_count, :integer
    field :active_count, :integer
    field :active, :boolean
    field :received_free_dc, :boolean
    field :webhook_key, :string
    field :flow, :string
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
    field :inserted_at, :naive_datetime
    field :payment_id, :string
    field :from_organization, :string
    field :to_organization, :string
  end

  paginated object :function do
    field :id, :id
    field :name, :string
    field :body, :string
    field :type, :string
    field :format, :string
    field :active, :boolean
    field :updated_at, :naive_datetime
    field :alerts, list_of(:alert)
  end

  object :event do
    field :id, :id
    field :device_id, :id
    field :description, :string
    field :category, :string
    field :frame_up, :integer
    field :frame_down, :integer
    field :sub_category, :string
    field :reported_at, :string
    field :reported_at_naive, :naive_datetime
    field :device_name, :string
    field :router_uuid, :string
    field :data, :string
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
    field :type, :string
  end

  query do
    @desc "Get paginated devices"
    paginated field :devices, :paginated_devices do
      arg :column, non_null(:string)
      arg :order, non_null(:string)
      resolve(&Console.Devices.DeviceResolver.paginate/2)
    end

    @desc "Get paginated devices for specified label ID"
    paginated field :devices_by_label, :paginated_devices do
      arg :label_id, non_null(:id)
      arg :column, non_null(:string)
      arg :order, non_null(:string)
      resolve(&Console.Devices.DeviceResolver.paginate_by_label/2)
    end

    @desc "Get flows for specified device ID"
    field :flows_by_device, list_of(:flow) do
      arg :device_id, non_null(:id)
      resolve(&Console.Flows.FlowResolver.get_by_device/2)
    end

    field :device_names, list_of(:device) do
      arg :device_ids, non_null(list_of(:id))
      resolve(&Console.Devices.DeviceResolver.get_names/2)
    end

    field :channel_names, list_of(:channel) do
      arg :channel_ids, non_null(list_of(:id))
      resolve(&Console.Channels.ChannelResolver.get_names/2)
    end

    field :function_names, list_of(:function) do
      arg :function_ids, non_null(list_of(:id))
      resolve(&Console.Functions.FunctionResolver.get_names/2)
    end

    field :label_names, list_of(:label) do
      arg :label_ids, non_null(list_of(:id))
      resolve(&Console.Labels.LabelResolver.get_names/2)
    end

    @desc "Get a single device"
    field :device, :device do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.find/2
    end

    field :device_count, :device_count do
      resolve &Console.Devices.DeviceResolver.get_device_count/2
    end

    field :device_stats, :device_stats do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.get_device_stats/2
    end

    field :device_dc_stats, :device_dc_stats do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.get_device_dc_stats/2
    end

    field :all_organization_hotspots, list_of(:organization_hotspot) do
      resolve &Console.OrganizationHotspots.OrganizationHotspotsResolver.all/2
    end

    field :hotspot_stats, list_of(:hotspot) do
      arg :column, non_null(:string)
      arg :order, non_null(:string)
      arg :page, non_null(:integer)
      arg :page_size, non_null(:integer)
      resolve &Console.HotspotStats.HotspotStatsResolver.all/2
    end

    field :followed_hotspot_stats, list_of(:hotspot) do
      arg :column, non_null(:string)
      arg :order, non_null(:string)
      arg :page, non_null(:integer)
      arg :page_size, non_null(:integer)
      resolve &Console.HotspotStats.HotspotStatsResolver.followed/2
    end

    field :hotspot_stats_device_count, :hotspot_stats_device_count do
      resolve &Console.HotspotStats.HotspotStatsResolver.device_count/2
    end

    field :hotspot, :hotspot do
      arg :address, non_null(:string)
      resolve &Console.HotspotStats.HotspotStatsResolver.show/2
    end

    field :hotspot_packets, list_of(:hotspot_packet) do
      arg :address, non_null(:string)
      resolve &Console.HotspotStats.HotspotStatsResolver.hotspot_show_packets/2
    end

    field :hotspot_devices_heard, list_of(:hotspot_device_heard) do
      arg :address, non_null(:string)
      arg :column, non_null(:string)
      arg :order, non_null(:string)
      arg :page, non_null(:integer)
      arg :page_size, non_null(:integer)
      resolve &Console.HotspotStats.HotspotStatsResolver.hotspot_show_devices_heard/2
    end

    @desc "Get device import jobs"
    paginated field :device_imports, :paginated_device_imports do
      resolve(&Console.Devices.DeviceResolver.paginate_device_imports/2)
    end

    field :device_events, list_of(:event) do
      arg :device_id, non_null(:id)

      resolve &Console.Devices.DeviceResolver.events/2
    end

    @desc "Get paginated labels for specified device ID"
    paginated field :labels_by_device, :paginated_labels do
      arg :device_id, non_null(:id)
      arg :column, non_null(:string)
      arg :order, non_null(:string)
      resolve(&Console.Labels.LabelResolver.paginate_by_device/2)
    end

    @desc "Get a single label"
    field :label, :label do
      arg :id, non_null(:id)
      resolve &Console.Labels.LabelResolver.find/2
    end

    field :all_labels, list_of(:label) do
      resolve &Console.Labels.LabelResolver.all/2
    end

    field :all_alerts, list_of(:alert) do
      resolve &Console.Alerts.AlertResolver.all/2
    end

    field :all_multi_buys, list_of(:multi_buy) do
      resolve &Console.MultiBuys.MultiBuyResolver.all/2
    end

    field :all_config_profiles, list_of(:config_profile) do
      resolve &Console.ConfigProfiles.ConfigProfileResolver.all/2
    end

    field :alerts_per_type, list_of(:alert) do
      arg :type, non_null(:string)
      resolve &Console.Alerts.AlertResolver.get_per_type/2
    end

    field :alerts_for_node, list_of(:alert) do
      arg :node_id, non_null(:id)
      arg :node_type, non_null(:string)
      resolve &Console.Alerts.AlertResolver.get_alerts_for_node/2
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

    field :all_channels, list_of(:channel) do
      resolve &Console.Channels.ChannelResolver.all/2
    end

    field :all_functions, list_of(:function) do
      resolve &Console.Functions.FunctionResolver.all/2
    end

    field :all_devices, list_of(:device) do
      resolve &Console.Devices.DeviceResolver.all/2
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

    @desc "Search for functions"
    field :search_functions, list_of(:function) do
      arg :query, :string
      resolve &Console.Search.SearchResolver.search_functions/2
    end

    @desc "Get paginated search results for hotspots"
    paginated field :search_hotspots, :paginated_hotspots do
      arg :query, :string
      arg :column, :string
      arg :order, :string
      resolve(&Console.Search.SearchResolver.paginated_search_hotspots/2)
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

    @desc "Get a single alert"
    field :alert, :alert do
      arg :id, non_null(:id)
      resolve &Console.Alerts.AlertResolver.find/2
    end

    @desc "Get a single multi_buy"
    field :multi_buy, :multi_buy do
      arg :id, non_null(:id)
      resolve &Console.MultiBuys.MultiBuyResolver.find/2
    end

     @desc "Get a single config_profile"
    field :config_profile, :config_profile do
      arg :id, non_null(:id)
      resolve &Console.ConfigProfiles.ConfigProfileResolver.find/2
    end

    paginated field :dc_purchases, :paginated_dc_purchases do
      resolve(&Console.DcPurchases.DcPurchaseResolver.paginate/2)
    end
  end
end
