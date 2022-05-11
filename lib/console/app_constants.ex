defmodule Console.AppConstants do
  use Agent

  def start_link(_initial_state) do
    allowed_integration_types =
      if Application.get_env(:console, :allowed_integrations) == "all" do
        {:ok, text} = File.read("./templates/allowed-integrations.json")
        Jason.decode!(text) |> Map.keys()
      else
        Application.get_env(:console, :allowed_integrations)
        |> String.trim(",")
        |> String.replace(" ", "")
        |> String.split(",")
      end

    Agent.start_link(fn -> allowed_integration_types end, name: __MODULE__)
  end

  def get_allowed_integration_types do
    Agent.get(__MODULE__, fn state -> state end)
  end
end
