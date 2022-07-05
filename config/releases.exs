import Config

config :logger, level: :info

secret_key_base = System.get_env("SECRET_KEY_BASE") ||
  raise """
  environment variable SECRET_KEY_BASE is missing.
  You can generate one by calling: mix phx.gen.secret
  """
config :console, ConsoleWeb.Endpoint,
  server: true,
  url: [host: "localhost"],
  cache_static_manifest: "priv/static/cache_manifest.json",
  http: [:inet6, port: 4000],
  secret_key_base: secret_key_base

db_host = System.get_env("DATABASE_HOST") ||
  raise """
  environment variable DATABASE_HOST is missing.
  """
config :console, Console.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: System.get_env("DATABASE_USER") || "postgres",
  password: System.get_env("DATABASE_PASSWORD") || "postgres",
  database: System.get_env("DATABASE_DB") || "console_dev",
  hostname: db_host,
  pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || "20")

config :console, oui: String.to_integer(System.get_env("OUI"))

config :console, ConsoleWeb.Guardian,
  issuer: "console",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY")

config :console,
  router_secrets: String.split(System.get_env("ROUTER_SECRETS"), ","),
  blockchain_api_retry: String.to_integer(System.get_env("BLOCKCHAIN_API_RETRY") || "1")

config :console,
  self_hosted: true

config :console,
  env_domain: System.get_env("ENV_DOMAIN")

config :console,
  auth0_baseurl: System.get_env("AUTH0_BASE_URL")

config :console,
  auth0_mfa_baseurl: System.get_env("AUTH0_MFA_BASE_URL")

config :console,
  auth0_domain: System.get_env("AUTH_0_DOMAIN")

config :console,
  auth0_client_id: System.get_env("AUTH_0_CLIENT_ID")

config :console,
  mapbox_pk: System.get_env("MAPBOX_PRIVATE_KEY")

config :console,
  mapbox_style_url: System.get_env("MAPBOX_STYLE_URL")

config :console,
  disable_user_burn: System.get_env("DISABLE_USER_BURN")

config :console,
  use_magic_auth: if System.get_env("USE_MAGIC_AUTH") == "true", do: true, else: false

config :console,
  magic_secret_key: System.get_env("MAGIC_SECRET_KEY")

config :console,
  magic_public_key: System.get_env("MAGIC_PUBLIC_KEY")

config :console,
  user_invite_only: System.get_env("USER_INVITE_ONLY")

config :console,
  use_amqp_events: if System.get_env("USE_AMQP_EVENTS") == "true", do: true, else: false

config :console,
  amqp_url: System.get_env("AMQP_URL")

config :console,
  socket_check_origin: System.get_env("SOCKET_CHECK_ORIGIN") || "//localhost"

config :console,
  max_devices_in_org: String.to_integer(System.get_env("MAX_DEVICES_IN_ORG") || "10000")

config :console,
  stripe_public_key: System.get_env("STRIPE_PUBLIC_KEY")

config :console,
  stripe_secret_key: System.get_env("STRIPE_SECRET_KEY")

config :console,
  stripe_minimum_purchase: String.to_integer(System.get_env("STRIPE_MINIMUM_PURCHASE") || "10")

config :console,
  dc_cost_multiplier: String.to_integer(System.get_env("DC_COST_MULTIPLIER") || "1")

config :console,
  allowed_integrations: System.get_env("ALLOWED_INTEGRATIONS") || "all"

config :console,
  allowed_functions: System.get_env("ALLOWED_FUNCTIONS") || "all"

config :console,
  app_title: System.get_env("APP_TITLE") || "Helium Console"

config :console,
  app_favicon_url: System.get_env("APP_FAVICON_URL") || "https://console.helium.com/favicon.png"

config :console, Console.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: System.get_env("SITE_DOMAIN_MAILGUN"),
  base_uri: System.get_env("MAILGUN_URL") || "https://api.mailgun.net/v3"

config :console,
  unsupported_countries: System.get_env("UNSUPPORTED_COUNTRIES") || "",
  unsupported_cities: System.get_env("UNSUPPORTED_CITIES") || "",
  unsupported_ukr_subdivisions:  System.get_env("UNSUPPORTED_UKR_SUBDIVISIONS") || ""