# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :console,
  ecto_repos: [Console.Repo]

# Configures the endpoint
config :console, ConsoleWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "qmS/z+jc4ZZNfmBN31tGhJbQ88aa0gD+NO8H/B5x+SCXC5XpXBAUsES7E4ubnxkJ",
  render_errors: [view: ConsoleWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Console.PubSub,
           adapter: Phoenix.PubSub.PG2]

config :console, :generators,
  migration: true,
  binary_id: true,
  sample_binary_id: "11111111-1111-1111-1111-111111111111"

config :console, Console.Guardian,
       issuer: "console",
       secret_key: "SIc3vGaukN3p6I+o/r2SEmguIhCuSRVCR3RX4w+yLDDpDpJinc7m4SsahlgmsmwK"

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
