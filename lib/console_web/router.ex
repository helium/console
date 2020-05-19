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
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug ConsoleWeb.Plug.RateLimit, ["auth_actions", 60]
  end

  scope "/graphql" do
    pipe_through ConsoleWeb.Plug.GraphqlPipeline

    forward "/", Absinthe.Plug, schema: ConsoleWeb.Schema
  end

  scope "/api", ConsoleWeb do
    pipe_through :api

    post "/users/resend_verification", UserController, :resend_verification
    post "/users/forgot_password", UserController, :forgot_password
    post "/users/change_password", UserController, :change_password
    get "/invitations/:token", InvitationController, :get_by_token
  end

  scope "/api", ConsoleWeb do
    pipe_through ConsoleWeb.AuthApiPipeline

    get "/users/current", UserController, :current
    post "/users", InvitationController, :accept
    resources "/devices", DeviceController, except: [:index, :new, :edit]
    post "/devices/delete", DeviceController, :delete
    post "/devices/debug", DeviceController, :debug
    resources "/labels", LabelController, only: [:create, :update, :delete]
    post "/labels/delete", LabelController, :delete
    post "/labels/remove_function", LabelController, :remove_function
    post "/labels/debug", LabelController, :debug
    resources "/channels", ChannelController, except: [:index, :new, :edit]
    resources "/organizations", OrganizationController, except: [:new, :edit] do
      post "/switch", OrganizationController, :switch
    end
    get "/mfa_enrollments", Auth0Controller, :get_enrolled_mfa
    post "/devices_labels", LabelController, :add_devices_to_label
    post "/devices_labels/delete", LabelController, :delete_devices_from_labels
    post "/channels_labels", LabelController, :add_labels_to_channel
    post "/channels_labels/delete", LabelController, :delete_labels_from_channel

    resources "/invitations", InvitationController, only: [:create, :delete]
    resources "/memberships", MembershipController, only: [:update, :delete]

    resources "/api_keys", ApiKeyController, only: [:create, :delete]
    resources "/functions", FunctionController, only: [:create, :delete, :update]
  end

  scope "/api/router", ConsoleWeb.Router do
    pipe_through :api

    post "/sessions", SessionController, :create
    post "/sessions/refresh", SessionController, :refresh
  end

  scope "/api/router", ConsoleWeb.Router do
    pipe_through ConsoleWeb.RouterApiPipeline

    resources "/devices", DeviceController, only: [:show] do
      post "/event", DeviceController, :add_device_event
    end
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
    resources "/labels", LabelController, only: [:index, :create, :delete]
    post "/devices/:device_id/labels", LabelController, :add_device_to_label
    delete "/devices/:device_id/labels/:label_id", LabelController, :delete_device_from_label
  end

  scope "/api/stats", ConsoleWeb do
    pipe_through ConsoleWeb.StatsApiPipeline

    get "/", StatsController, :show
  end

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.SentEmailViewerPlug
  end

  scope "/", ConsoleWeb do
    pipe_through :browser # Use the default browser stack

    get "/users/confirm_email/:token", UserController, :confirm_email, as: "confirm_email"
    get "/users/reset_password/:token", UserController, :reset_password, as: "reset_password"

    get "/invitations/accept/:token", InvitationController, :redirect_to_register, as: "accept_invitation"
    get "/api_keys/accept/:token", ApiKeyController, :accept, as: "accept_api_key"

    get "/*path", PageController, :index
  end
end
