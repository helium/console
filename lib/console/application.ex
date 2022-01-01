defmodule Console.Application do
  use Application

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: Console.PubSub},
      {Console.Repo, []},
      {ConsoleWeb.Endpoint, []},
      {Absinthe.Subscription, [ConsoleWeb.Endpoint]},
      {ConsoleWeb.Monitor, %{}},
      {Task.Supervisor, name: ConsoleWeb.TaskSupervisor},
      Console.Scheduler
    ]

    # :ok =
    #   :telemetry.attach(
    #     "prometheus-ecto",
    #     [:console, :repo, :query],
    #     &App.Repo.Instrumenter.handle_event/4,
    #     %{}
    #   )

    # App.PhoenixInstrumenter.setup()
    # App.PipelineInstrumenter.setup()
    # App.Repo.Instrumenter.setup()
    # Prometheus.Registry.register_collector(:prometheus_process_collector)
    # App.PrometheusExporter.setup()

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Console.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ConsoleWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
