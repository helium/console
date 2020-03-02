defmodule ConsoleWeb.EventController do
  use ConsoleWeb, :controller

  alias Console.Events
  alias Console.Events.Event

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)
end
