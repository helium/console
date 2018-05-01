use Mix.Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with brunch.io to recompile .js and .css sources.
config :console, ConsoleWeb.Endpoint,
  http: [port: 4000],
  check_origin: false

# Do not print debug messages in production
config :logger, level: :info

# Configure your database
config :console, Console.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: false

config :cloak, Cloak.AES.CTR,
  tag: "AES",
  default: true,
  keys: [
    %{tag: <<1>>, key: :base64.decode(System.get_env("CLOAK_SECRET_KEY")), default: true}
  ]

config :console,
  router_secrets: String.split(System.get_env("ROUTER_SECRETS"), ",")

config :console, Console.Mailer,
  adapter: Bamboo.LocalAdapter

config :console, recaptcha_secret: System.get_env("RECAPTCHA_SECRET")
