defmodule Console.Gateways do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Gateways.Gateway
  alias Console.HardwareIdentifiers.HardwareIdentifier

  def list_gateways do
    Repo.all(Gateway)
  end

  def get_gateway!(id), do: Repo.get!(Gateway, id)

  def fetch_assoc(%Gateway{} = gateway, assoc \\ [:events, :team]) do
    Repo.preload(gateway, assoc)
  end

  def create_gateway(attrs \\ %{}, attempt \\ 1) do
    hardware_identifier_changeset =
      %HardwareIdentifier{}
      |> HardwareIdentifier.changeset

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:hardware_identifier, hardware_identifier_changeset)
      |> Ecto.Multi.run(:gateway, fn %{hardware_identifier: hardware_identifier} ->
        attrs = Map.merge(attrs, %{hardware_identifier_id: hardware_identifier.id})

        %Gateway{}
        |> Gateway.changeset(attrs)
        |> Repo.insert()
      end)
      |> Repo.transaction

    case result do
      {:ok, %{gateway: gateway, hardware_identifier: _}} -> {:ok, gateway}
      {:error, _, %Ecto.Changeset{} = changeset, _} ->
        case changeset.errors do
          [token: {"has already been taken", []}] ->
            case attempt < 3 do
              true -> create_gateway(attrs, attempt + 1)
              false -> {:error, changeset}
            end
          _ -> {:error, changeset}
        end
    end
  end

  def update_gateway(%Gateway{} = gateway, attrs) do
    gateway
    |> Gateway.changeset(attrs)
    |> Repo.update()
  end

  def delete_gateway(%Gateway{} = gateway) do
    result = Repo.get!(HardwareIdentifier, gateway.hardware_identifier_id)
      |> Repo.delete
    case result do
      {:ok, %HardwareIdentifier{}} -> {:ok, gateway}
      _ -> result
    end
  end

  def change_gateway(%Gateway{} = gateway) do
    Gateway.changeset(gateway, %{})
  end
end
