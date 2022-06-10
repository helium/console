use Mix.Config

config :console, ConsoleWeb.Endpoint,
  load_from_system_env: true,
  url: [scheme: "https", host: System.get_env("ENV_DOMAIN"), port: 443],
  force_ssl: [rewrite_on: [:x_forwarded_proto]],
  cache_static_manifest: "priv/static/cache_manifest.json",
  secret_key_base: Map.fetch!(System.get_env(), "SECRET_KEY_BASE")

config :logger, level: :info

config :console, Console.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: true

config :console, ConsoleWeb.Guardian,
  issuer: "console",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY")

config :console, oui: String.to_integer(System.get_env("OUI"))

config :console, Console.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: "mg2.helium.com"

config :console,
  router_secrets: String.split(System.get_env("ROUTER_SECRETS"), ","),
  blockchain_api_retry: String.to_integer(System.get_env("BLOCKCHAIN_API_RETRY") || "1")

config :console,
  mailerlite_api_key: System.get_env("MAILERLITE_KEY")

config :console,
  auth0_baseurl: System.get_env("AUTH0_BASE_URL")

config :console,
  auth0_mfa_baseurl: System.get_env("AUTH0_MFA_BASE_URL")

config :appsignal, :config,
  active: true,
  name: System.get_env("APPSIGNAL_APP_NAME"),
  push_api_key: System.get_env("APPSIGNAL_API_KEY"),
  env: Mix.env,
  ignore_actions: ["ConsoleWeb.Router.DeviceController#get_by_other_creds", "ConsoleWeb.Router.DeviceController#add_device_event"]

config :console,
  stripe_secret_key: System.get_env("STRIPE_SECRET_KEY")

config :console,
  stripe_minimum_purchase: 10

config :console,
  dc_cost_multiplier: 1

config :console,
  use_magic_auth: if System.get_env("USE_MAGIC_AUTH") == "true", do: true, else: false

config :console,
  magic_secret_key: System.get_env("MAGIC_SECRET_KEY")

config :console,
  intercom_id_secret: System.get_env("INTERCOM_ID_SECRET")

config :console,
  use_amqp_events: if System.get_env("USE_AMQP_EVENTS") == "true", do: true, else: false

config :console,
  impose_hard_cap: if System.get_env("IMPOSE_HARD_CAP") == "true", do: true, else: false

config :console,
  amqp_url: System.get_env("AMQP_URL")

config :console,
  allowed_ip_range: [
    "173.245.48.0",
    "103.21.244.0",
    "103.22.200.0",
    "103.31.4.0",
    "141.101.64.0",
    "108.162.192.0",
    "190.93.240.0",
    "188.114.96.0",
    "197.234.240.0",
    "198.41.128.0",
    "162.158.0.0",
    "104.16.0.0",
    "172.64.0.0",
    "131.0.72.0"
  ]

config :console,
  max_devices_in_org: String.to_integer(System.get_env("MAX_DEVICES_IN_ORG") || "10000")

config :console,
  allowed_integrations: System.get_env("ALLOWED_INTEGRATIONS") || "all"

config :console,
  allowed_functions: System.get_env("ALLOWED_FUNCTIONS") || "all"

config :console,
  socket_check_origin: System.get_env("SOCKET_CHECK_ORIGIN")

config :console,
  recaptcha_secret_key: System.get_env("RECAPTCHA_SECRET_KEY")

# config :prometheus, App.PrometheusExporter,
#   path: "/metrics",
#   format: :auto,
#   registry: :default,
#   auth: {:basic, System.get_env("PROMETHEUS_USERNAME"), System.get_env("PROMETHEUS_PASSWORD")}
