use Mix.Config

config :console, ConsoleWeb.Endpoint,
  load_from_system_env: true,
  url: [scheme: "https", host: System.get_env("HOSTNAME"), port: 443],
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

config :cloak, Cloak.AES.CTR,
  tag: "AES",
  default: true,
  keys: [
    %{tag: <<1>>, key: :base64.decode(System.get_env("CLOAK_SECRET_KEY")), default: true}
  ]

config :console,
  router_secrets: String.split(System.get_env("ROUTER_SECRETS"), ","),
  blockchain_api_retry: String.to_integer(System.get_env("BLOCKCHAIN_API_RETRY") || "1"),
  blockchain_api_url: System.get_env("BLOCKCHAIN_API_URL")

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
  env: Mix.env

config :console,
  stripe_secret_key: System.get_env("STRIPE_SECRET_KEY")

config :console,
  use_magic_auth: if System.get_env("USE_MAGIC_AUTH") == "true", do: true, else: false

config :console,
  magic_secret_key: System.get_env("MAGIC_SECRET_KEY")

config :console,
  intercom_id_secret: System.get_env("INTERCOM_ID_SECRET")

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
