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

  scope "/api", ConsoleWeb do
    pipe_through :api

    post "/users", UserController, :create
    post "/sessions", SessionController, :create
  end

  scope "/api", ConsoleWeb do
    pipe_through ConsoleWeb.AuthApiPipeline

    resources "/devices", DeviceController, except: [:new, :edit]

    get "/secret", PageController, :secret
  end

  if Mix.env == :dev do
    forward "/sent_emails", Bamboo.SentEmailViewerPlug
  end

  scope "/", ConsoleWeb do
    pipe_through :browser # Use the default browser stack

    get "/users/confirm_email/:token", UserController, :confirm_email, as: "confirm_email"

    get "/*path", PageController, :index
  end
end
