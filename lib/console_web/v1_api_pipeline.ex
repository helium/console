defmodule ConsoleWeb.V1ApiPipeline do
  use Plug.Builder

  plug ConsoleWeb.Plug.RateLimit, ["api_v1_actions", 6000]
  plug ConsoleWeb.Plug.CheckDomain
  plug ConsoleWeb.Plug.VerifyApiKey
end
