defmodule Console.AppConstants do
  use Agent

  def start_link(_initial_state) do
    allowed_integration_types =
      if File.exists?("allowed-integrations.json") do
        {:ok, text} = File.read("allowed-integrations.json")
        json = Jason.decode!(text)
        json |> Map.keys() |> Enum.filter(fn type -> Map.get(json, type) == true end)
      else
        {:ok, text} = File.read("./templates/allowed-integrations.json")
        Jason.decode!(text) |> Map.keys()
      end

    Agent.start_link(fn -> allowed_integration_types end, name: __MODULE__)
  end

  def get_allowed_integration_types do
    Agent.get(__MODULE__, fn state -> state end)
  end
end
