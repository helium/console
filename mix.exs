defmodule Console.Mixfile do
  use Mix.Project

  def project do
    [
      app: :console,
      version: "0.0.1",
      elixir: "~> 1.9.0",
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
      extra_applications: [:logger, :runtime_tools]
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
      {:phoenix, "~> 1.5.7"},
      {:phoenix_ecto, "~> 4.2.1"},
      {:ecto, "~> 3.4.6"},
      {:ecto_sql, "~> 3.4.5"},
      {:plug_cowboy, "~> 2.4.1"},
      {:cowboy, "~> 2.7.0"},
      {:plug, "~> 1.11.0"},
      {:absinthe, "~> 1.5.5"},
      {:absinthe_plug, "~> 1.5.2"},
      {:absinthe_phoenix, "~> 2.0"},
      {:phoenix_pubsub, "~> 2.0"},
      {:scrivener_ecto, "~> 2.7"},
      {:ex_machina, "~> 2.5.0", only: :test},
      {:poison, "~> 4.0.1"},
      {:jason, "~> 1.2.2"},
      {:cloak, "~> 0.6.1"},
      {:postgrex, "~> 0.15.7"},
      {:phoenix_html, "~> 2.14.3"},
      {:phoenix_live_reload, "~> 1.3.0", only: :dev},
      {:gettext, "~> 0.18.2"},
      {:comeonin, "~> 5.3.1"},
      {:bcrypt_elixir, "~> 2.3.0"},
      {:guardian, "~> 2.1"},
      {:bamboo, "~> 1.6.0"},
      {:httpoison, "~> 1.8.0"},
      {:httpoison_retry, "~> 1.0.0"},
      {:html_sanitize_ex, "~> 1.4.1"},
      {:cors_plug, "~> 2.0.2"},
      {:hammer, "~> 6.0"},
      {:joken, "~> 2.3.0"},
      {:mox, "~> 0.5.2", only: :test},
      {:appsignal, "~> 1.0"},
      {:inet_cidr, "~> 1.0.4"},
      {:quantum, "~> 3.3.0"},
      {:timex, "~> 3.6.3"},
      {:magic_admin, "~> 0.4.0"}
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
