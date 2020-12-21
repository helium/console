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
      {:phoenix, "~> 1.4.10"},
      {:phoenix_ecto, "~> 4.0"},
      {:ecto, "~> 3.2.3"},
      {:ecto_sql, "~> 3.2"},
      {:plug_cowboy, "~> 2.1.0"},
      {:plug, "~> 1.8.3"},
      {:ex_machina, "~> 2.3", only: :test},
      {:scrivener_ecto, "~> 2.2"},
      {:poison, "~> 4.0.1"},
      {:jason, "~> 1.1"},
      {:cloak, "~> 0.6.1"},
      {:absinthe, "~> 1.4"},
      {:absinthe_plug, "~> 1.4"},
      {:absinthe_phoenix, "~> 1.4"},
      {:phoenix_pubsub, "~> 1.1.2"},
      {:postgrex, "~> 0.15.0"},
      {:phoenix_html, "~> 2.13.0"},
      {:phoenix_live_reload, "~> 1.2.0", only: :dev},
      {:gettext, "~> 0.17.0"},
      {:comeonin, "~> 5.0.0"},
      {:bcrypt_elixir, "~> 2.0"},
      {:guardian, "~> 1.2.1"},
      {:bamboo, "~> 1.3.0"},
      {:httpoison, "~> 1.6.1"},
      {:pot, "~> 0.10.2"},
      {:html_sanitize_ex, "~> 1.3.0"},
      {:cors_plug, "~> 2.0"},
      {:hammer, "~> 6.0"},
      {:joken, "~> 2.2.0"},
      {:mox, "~> 0.5.2", only: :test},
      {:appsignal, "~> 1.0"},
      {:inet_cidr, "~> 1.0.0"},
      {:quantum, "~> 3.0"}
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
