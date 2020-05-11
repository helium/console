defmodule ConsoleWeb.StatsApiPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console

  plug ConsoleWeb.Plug.CheckDomain
  plug ConsoleWeb.Plug.RateLimit, ["stats_actions", 30]
  plug ConsoleWeb.Plug.VerifyStatsSecretVersion
  # plug ConsoleWeb.Plug.ConnInterceptor # good for debugging
end
