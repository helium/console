defmodule ConsoleWeb.AuthApiPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console

  plug ConsoleWeb.Plug.RateLimit, ["internal_api_actions", 120]
  plug ConsoleWeb.Plug.VerifyAccessToken
  plug ConsoleWeb.Plug.PutCurrentUser
  plug ConsoleWeb.Plug.PutCurrentOrganization
  # plug ConsoleWeb.Plug.ConnInterceptor # good for debugging
end
