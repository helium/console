defmodule ConsoleWeb.Router do
  use ConsoleWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/graphql" do
    pipe_through ConsoleWeb.Plug.GraphqlPipeline

    forward "/", Absinthe.Plug, schema: ConsoleWeb.Schema
  end

  scope "/api", ConsoleWeb do
    pipe_through :api

    post "/users", UserController, :create
    post "/users/resend_verification", UserController, :resend_verification
    post "/users/forgot_password", UserController, :forgot_password
    post "/users/change_password", UserController, :change_password
    post "/sessions", SessionController, :create
    post "/2fa/verify", TwoFactorController, :verify
    get "/invitations/:token", InvitationController, :get_by_token
  end

  scope "/api", ConsoleWeb do
    pipe_through ConsoleWeb.AuthApiPipeline

    resources "/devices", DeviceController, except: [:new, :edit]
    post "/devices/delete", DeviceController, :delete
    resources "/labels", LabelController, only: [:create, :update, :delete]
    post "/labels/delete", LabelController, :delete
    resources "/gateways", GatewayController, except: [:new, :edit]
    resources "/channels", ChannelController, except: [:new, :edit]
    resources "/organizations", OrganizationController, except: [:new, :edit] do
      post "/switch", OrganizationController, :switch
    end

    post "/devices_labels", LabelController, :add_devices_to_label
    post "/devices_labels/delete", LabelController, :delete_devices_from_labels
    post "/channels_labels", LabelController, :add_labels_to_channel
    post "/channels_labels/delete", LabelController, :delete_labels_from_channel

    resources "/invitations", InvitationController, only: [:index, :create, :delete]
    resources "/memberships", MembershipController, only: [:index, :update, :delete]

    resources "/api_keys", ApiKeyController, only: [:create, :delete]

    get "/2fa", TwoFactorController, :new
    post "/2fa", TwoFactorController, :create
    post "/2fa/skip", TwoFactorController, :skip
    post "/sessions/refresh", SessionController, :refresh
    get "/users/current", UserController, :current
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
    post "/gateways/register", GatewayController, :register
    post "/gateways/verify", GatewayController, :verify
  end

  scope "/api/v1", ConsoleWeb.V1 do
    pipe_through ConsoleWeb.V1ApiPipeline

    resources "/devices", DeviceController, only: [:index, :show, :create, :delete]
    get "/labels", LabelController, :index
    post "/devices_labels", LabelController, :add_device_to_label
    post "/devices_labels/delete", LabelController, :delete_device_from_label
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

    get "/invitations/accept/:token", InvitationController, :accept, as: "accept_invitation"

    get "/*path", PageController, :index
  end
end
