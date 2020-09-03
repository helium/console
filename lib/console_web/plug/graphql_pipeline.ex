defmodule ConsoleWeb.Plug.GraphqlPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console,
    module: ConsoleWeb.Guardian,
    error_handler: ConsoleWeb.AuthErrorHandler

  plug ConsoleWeb.Plug.CheckDomain
  plug ConsoleWeb.Plug.RateLimit, ["gql_actions", 300]
  plug ConsoleWeb.Plug.VerifyRemoteIpRange
  plug ConsoleWeb.Plug.VerifyAccessToken
  plug ConsoleWeb.Plug.PutCurrentUser
  plug ConsoleWeb.Plug.PutCurrentOrganization
  plug ConsoleWeb.Plug.GraphqlContext
  # plug ConsoleWeb.Plug.ConnInterceptor # good for debugging
end
