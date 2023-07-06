use Mix.Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with brunch.io to recompile .js and .css sources.
config :console, ConsoleWeb.Endpoint,
  http: [port: 4000],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [yarn: ["run", "watch",
                    cd: Path.expand("../assets", __DIR__)]]

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# command from your terminal:
#
#     openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" -keyout priv/server.key -out priv/server.pem
#
# The `http:` config above can be replaced with:
#
#     https: [port: 4000, keyfile: "priv/server.key", certfile: "priv/server.pem"],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :console, ConsoleWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r{priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$},
      ~r{priv/gettext/.*(po)$},
      ~r{lib/console_web/views/.*(ex)$},
      ~r{lib/console_web/templates/.*(eex)$}
    ]
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Configure your database
config :console, Console.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "console_dev",
  hostname: "localhost",
  pool_size: 10

config :console,
  router_secrets: [
    "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
  ],
  blockchain_api_retry: 1

config :console, Console.Mailer,
  adapter: Bamboo.LocalAdapter

config :console, env: Mix.env

config :console, oui: 1

config :console,
  stripe_secret_key: "sk_test_Lvy2r3SRCzwjfh3tvZsOBTrG00Cm8M7v1q"

config :console,
  stripe_minimum_purchase: 0.5

config :console,
  dc_cost_multiplier: 1

config :console,
  magic_secret_key: "sk_live_0AA176BA66E3CA27"

config :console,
  use_magic_auth: true

config :console,
  use_amqp_events: false

config :console,
  amqp_url: "amqp://guest:guest@localhost"

config :console,
  allowed_ip_range: ["127.0.0.1"]

config :console,
  socket_check_origin: "//localhost"

config :console,
  max_devices_in_org: 1000

config :console,
  impose_hard_cap: false

config :console,
  allowed_integrations: "all"

config :console,
  allowed_functions: "all"

config :console,
  recaptcha_secret_key: "6Len2logAAAAAJMuljKEX6LrQqe7RWdfNqPDapU5"

config :logger, level: :debug

config :console,
  unsupported_countries: "",
  unsupported_cities: "",
  unsupported_ukr_subdivisions: ""

config :console,
  latest_terms_version: "v2"
