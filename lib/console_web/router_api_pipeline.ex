defmodule ConsoleWeb.RouterApiPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :console,
    module: ConsoleWeb.Guardian,
    error_handler: ConsoleWeb.AuthErrorHandler

  plug Guardian.Plug.VerifyHeader, claims: %{"typ" => "router"}
  plug Guardian.Plug.EnsureAuthenticated
  plug ConsoleWeb.Plug.VerifyRouterSecretVersion
  plug ConsoleWeb.Plug.VerifyRouterIpAddress
  # plug ConsoleWeb.Plug.ConnInterceptor # good for debugging
end
