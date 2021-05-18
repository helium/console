defmodule ConsoleWeb.Plug.GraphqlPipeline do
  use Plug.Builder

  plug ConsoleWeb.Plug.CheckDomain
  plug ConsoleWeb.Plug.RateLimit, ["gql_actions", 300]
  plug ConsoleWeb.Plug.VerifyRemoteIpRange
  plug ConsoleWeb.Plug.VerifyAccessToken
  plug ConsoleWeb.Plug.PutCurrentUser
  plug ConsoleWeb.Plug.PutCurrentOrganization
  plug ConsoleWeb.Plug.GraphqlContext
end
