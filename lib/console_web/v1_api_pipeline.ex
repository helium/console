defmodule ConsoleWeb.V1ApiPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console

  plug ConsoleWeb.Plug.RateLimit, ["api_v1_actions", 6000]
  plug ConsoleWeb.Plug.VerifyApiKey
end
