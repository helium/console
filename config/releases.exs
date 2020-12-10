import Config

config :logger, level: :info

secret_key_base = System.get_env("SECRET_KEY_BASE") ||
  raise """
  environment variable SECRET_KEY_BASE is missing.
  You can generate one by calling: mix phx.gen.secret
  """
config :console, ConsoleWeb.Endpoint,
  server: true,
  url: [host: "example.com", port: 80], # UPDATE TO YOUR HOST (localhost, test.com, etc.)
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

config :cloak, Cloak.AES.CTR,
  tag: "AES",
  default: true,
  keys: [
    %{tag: <<1>>, key: :base64.decode(System.get_env("CLOAK_SECRET_KEY")), default: true}
  ]

config :console,
  router_secrets: String.split(System.get_env("ROUTER_SECRETS"), ",")

config :console,
  self_hosted: true

config :console,
  auth0_baseurl: System.get_env("AUTH0_BASE_URL")

config :console, Console.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: System.get_env("SITE_DOMAIN_MAILGUN")
