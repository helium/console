defmodule Console.Mixfile do
  use Mix.Project

  def project do
    [
      app: :console,
      version: "2.0.0",
      elixir: "~> 1.12.1",
      elixirc_paths: elixirc_paths(Mix.env),
      compilers: [:phoenix, :gettext] ++ Mix.compilers,
      start_permanent: Mix.env == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Console.Application, []},
      extra_applications: [:logger, :runtime_tools, :crypto]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.6.6"},
      {:phoenix_ecto, "~> 4.4.0"},
      {:ecto, "~> 3.7.2"},
      {:ecto_sql, "~> 3.7.2"},
      {:plug_cowboy, "~> 2.5.2"},
      {:cowboy, "~> 2.9.0"},
      {:plug, "~> 1.13.5"},
      {:absinthe, "~> 1.7.0"},
      {:absinthe_plug, "~> 1.5.8"},
      {:absinthe_phoenix, "~> 2.0.2"},
      {:phoenix_pubsub, "~> 2.1.1"},
      {:scrivener_ecto, "~> 2.7"},
      {:ex_machina, "~> 2.7.0", only: :test},
      {:poison, "~> 5.0.0"},
      {:jason, "~> 1.3.0"},
      {:cloak_ecto, "~> 1.2.0"},
      {:postgrex, "~> 0.16.2"},
      {:phoenix_html, "~> 3.2.0"},
      {:phoenix_live_reload, "~> 1.3.3", only: :dev},
      {:gettext, "~> 0.19.1"},
      {:guardian, "~> 2.2.3"},
      {:bamboo, "~> 2.2.0"},
      {:bamboo_phoenix, "~> 1.0.0"},
      {:httpoison, "~> 1.8.1"},
      {:httpoison_retry, "~> 1.1.0"},
      {:cors_plug, "~> 3.0.3"},
      {:html_sanitize_ex, "~> 1.4.2"},
      {:hammer, "~> 6.0"},
      {:joken, "~> 2.4.1"},
      {:mox, "~> 1.0.1", only: :test},
      {:appsignal, "~> 1.13.5"},
      {:inet_cidr, "~> 1.0.4"},
      {:quantum, "~> 3.4.0"},
      {:timex, "~> 3.7.7"},
      {:magic_admin, "~> 0.5.0"},
      {:amqp, "~> 3.1.1"},
      {:libp2p_crypto, "~>1.4.1"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
