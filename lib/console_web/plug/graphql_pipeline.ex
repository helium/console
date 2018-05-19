defmodule ConsoleWeb.Plug.GraphqlPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console,
    module: ConsoleWeb.Guardian,
    error_handler: ConsoleWeb.AuthErrorHandler

  plug Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"}
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
  plug ConsoleWeb.Plug.PutCurrentUser
  plug ConsoleWeb.Plug.PutCurrentTeam
  plug ConsoleWeb.Plug.GraphqlContext
  # plug ConsoleWeb.Plug.ConnInterceptor # good for debugging
end
