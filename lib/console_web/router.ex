defmodule ConsoleWeb.Router do
  use ConsoleWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug ConsoleWeb.Plug.CheckDomain
    plug ConsoleWeb.Plug.RateLimit, ["browser_actions", 60]
    plug ConsoleWeb.Plug.VerifyRemoteIpRange
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug ConsoleWeb.Plug.CheckDomain
    plug ConsoleWeb.Plug.RateLimit, ["auth_actions", 60]
    plug ConsoleWeb.Plug.VerifyRemoteIpRange
  end

  scope "/graphql" do
    pipe_through ConsoleWeb.Plug.GraphqlPipeline

    forward "/", Absinthe.Plug, schema: ConsoleWeb.Schema
  end

  scope "/api", ConsoleWeb do
    pipe_through :api

    get "/invitations/:token", InvitationController, :get_by_token
    post "/subscribe_new_user", Auth0Controller, :subscribe_new_user
  end

  scope "/api", ConsoleWeb do
    pipe_through ConsoleWeb.AuthApiPipeline

    post "/users", InvitationController, :accept, as: "user_join_from_invitation"
    resources "/devices", DeviceController, except: [:index, :new, :edit]
    post "/devices/delete", DeviceController, :delete
    post "/devices/set_active", DeviceController, :set_active
    get "/devices/:device_id/events", DeviceController, :get_events
    get "/ttn/devices", DeviceController, :get_ttn
    post "/ttn/devices/import", DeviceController, :import_ttn
    post "/generic/devices/import", DeviceController, :import_generic
    resources "/labels", LabelController, only: [:create, :update, :delete]
    post "/labels/delete", LabelController, :delete
    post "/labels/swap_label", LabelController, :swap_label
    post "/labels/update_notification_settings", LabelNotificationSettingsController, :update
    post "/labels/update_notification_webhooks", LabelNotificationWebhooksController, :update
    resources "/alerts", AlertController, only: [:index, :show, :create, :delete]
    resources "/channels", ChannelController, except: [:index, :new, :edit]
    resources "/organizations", OrganizationController, except: [:new, :edit]
    post "/channels/ubidots", ChannelController, :get_ubidots_url
    get "/mfa_enrollments", Auth0Controller, :get_enrolled_mfa
    post "/devices_labels", LabelController, :add_devices_to_label
    post "/devices_labels/delete", LabelController, :delete_devices_from_labels

    resources "/invitations", InvitationController, only: [:create, :delete]
    resources "/memberships", MembershipController, only: [:update, :delete]

    resources "/api_keys", ApiKeyController, only: [:create, :delete]
    resources "/functions", FunctionController, only: [:create, :delete, :update]

    post "/data_credits/create_customer_and_charge", DataCreditController, :create_customer_id_and_charge
    post "/data_credits/create_charge", DataCreditController, :create_charge
    get "/data_credits/payment_methods", DataCreditController, :get_payment_methods
    get "/data_credits/setup_payment_method", DataCreditController, :get_setup_payment_method
    post "/data_credits/set_default_payment_method", DataCreditController, :set_default_payment_method
    post "/data_credits/remove_payment_method", DataCreditController, :remove_payment_method
    post "/data_credits/create_dc_purchase", DataCreditController, :create_dc_purchase
    post "/data_credits/set_automatic_payments", DataCreditController, :set_automatic_payments
    post "/data_credits/transfer_dc", DataCreditController, :transfer_dc
    get "/data_credits/generate_memo", DataCreditController, :generate_memo
    get "/data_credits/router_address", DataCreditController, :get_router_address
    get "/data_credits/get_hnt_price", DataCreditController, :get_hnt_price

    post "/flows/update", FlowsController, :update_edges

    post "/clear_downlink_queue", DownlinkController, :clear_downlink_queue
    get "/downlink_queue", DownlinkController, :fetch_downlink_queue
  end

  scope "/api/router", ConsoleWeb.Router do
    pipe_through :api

    post "/sessions", SessionController, :create
    post "/sessions/refresh", SessionController, :refresh
  end

  scope "/api/router", ConsoleWeb.Router do
    pipe_through ConsoleWeb.RouterApiPipeline

    resources "/devices", DeviceController, only: [:index, :show] do
      post "/event", DeviceController, :add_device_event
    end
    resources "/organizations", OrganizationController, only: [:show]
    post "/organizations/burned", OrganizationController, :burned_dc
    post "/organizations/manual_update_router_dc", OrganizationController, :manual_update_router_dc
  end

  scope "/api/v1", ConsoleWeb.V1 do
    pipe_through :api

    post "/down/:channel_id/:downlink_token/:device_id", DownlinkController, :down
    post "/down/:channel_id/:downlink_token", DownlinkController, :down
  end

  scope "/api/v1", ConsoleWeb.V1 do
    pipe_through ConsoleWeb.V1ApiPipeline

    get "/organization", OrganizationController, :show
    resources "/devices", DeviceController, only: [:index, :show, :create, :delete]
    resources "/labels", LabelController, only: [:index, :show, :create, :delete]
    post "/devices/:device_id/labels", LabelController, :add_device_to_label
    delete "/devices/:device_id/labels/:label_id", LabelController, :delete_device_from_label
    post "/labels/:id/multi_buy", LabelController, :update_multi_buy
    post "/labels/:id/notification_email", LabelNotificationSettingsController, :update
    post "/labels/:id/notification_webhook", LabelNotificationWebhooksController, :update
    post "/devices/discover", DeviceController, :discover_device
  end

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.SentEmailViewerPlug
  end

  scope "/", ConsoleWeb do
    pipe_through :browser # Use the default browser stack

    get "/invitations/accept/:token", InvitationController, :redirect_to_register, as: "accept_invitation"
    get "/api_keys/accept/:token", ApiKeyController, :accept, as: "accept_api_key"
    get "/google14b344de8ed0f4f1.html", PageController, :google_verify

    get "/*path", PageController, :index
  end
end
