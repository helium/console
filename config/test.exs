use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :console, ConsoleWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :console, Console.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "console_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :console, Console.Mailer,
  adapter: Bamboo.TestAdapter

config :console, env: Mix.env

config :cloak, Cloak.AES.CTR,
  tag: "AES",
  default: true,
  keys: [
    %{tag: <<1>>, key: :base64.decode("/QCxhn/9t2SM8GiLXVDR1jFO/vENLGCnXADGAhGPM30="), default: true}
  ]

config :comeonin, :bcrypt_log_rounds, 4
config :comeonin, :pbkdf2_rounds, 1
config :console, oui: 1

config :console, :access_token_decoder, Console.AccessTokenDecoder.MockDecodeAccessToken

config :console,
  router_secrets: [
    "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/"
  ],
  blockchain_api_retry: "1",
  blockchain_api_url: "https://api.helium.wtf/v1"
