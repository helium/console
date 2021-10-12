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
  pool_size: 10

config :console, oui: String.to_integer(System.get_env("OUI"))

config :console, ConsoleWeb.Guardian,
  issuer: "console",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY")

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

config :console, Console.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: System.get_env("SITE_DOMAIN_MAILGUN"),
  base_uri: System.get_env("MAILGUN_URL") || "https://api.mailgun.net/v3"
