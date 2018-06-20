defmodule Console.HardwareIdentifiers do
  alias Console.Gateways.Gateway
  alias Console.HardwareIdentifiers.HardwareIdentifier

  def get_resource_by_hardware_identifier(token, resource) do
    case Base.decode32(token) do
      {:ok, token} ->
        case HardwareIdentifier.get_associated_resource(token, resource) do
          gateway = %Gateway{} -> gateway
          nil -> :error
        end
      :error -> :error
    end
  end
end
