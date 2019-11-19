defmodule ConsoleWeb.StatsApiPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console

  plug ConsoleWeb.Plug.VerifyStatsSecretVersion
  # plug ConsoleWeb.Plug.ConnInterceptor # good for debugging
end
