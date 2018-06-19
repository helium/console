defmodule Console.HardwareIdentifiers do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.HardwareIdentifiers.HardwareIdentifier

  def get_resource_by_hardware_identifier(token, resource) do
    case Base.decode32(token) do
      {:ok, token} ->
        case Repo.get_by(HardwareIdentifier, token: token) do
          hardwareIdentifier = %HardwareIdentifier{} -> hardwareIdentifier |> Repo.preload(resource)
          nil -> :error
        end
      :error -> :error
    end
  end
end
