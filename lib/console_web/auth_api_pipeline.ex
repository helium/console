defmodule ConsoleWeb.AuthApiPipeline do
  use Plug.Builder

  plug ConsoleWeb.Plug.CheckDomain
  plug ConsoleWeb.Plug.RateLimit, ["internal_api_actions", 90]
  plug ConsoleWeb.Plug.VerifyRemoteIpRange
  plug ConsoleWeb.Plug.VerifyAccessToken
  plug ConsoleWeb.Plug.PutCurrentUser
  plug ConsoleWeb.Plug.PutCurrentOrganization
end
