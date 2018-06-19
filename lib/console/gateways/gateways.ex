defmodule Console.Gateways do
  @moduledoc """
  The Gateways context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Gateways.Gateway
  alias Console.Gateways.GatewayIdentifier

  @doc """
  Returns the list of gateways.

  ## Examples

      iex> list_gateways()
      [%Gateway{}, ...]

  """
  def list_gateways do
    Repo.all(Gateway)
  end

  @doc """
  Gets a single gateway.

  Raises `Ecto.NoResultsError` if the Gateway does not exist.

  ## Examples

      iex> get_gateway!(123)
      %Gateway{}

      iex> get_gateway!(456)
      ** (Ecto.NoResultsError)

  """
  def get_gateway!(id), do: Repo.get!(Gateway, id)

  def fetch_assoc(%Gateway{} = gateway, assoc \\ [:events, :team]) do
    Repo.preload(gateway, assoc)
  end

  @doc """
  Creates a gateway.

  ## Examples

      iex> create_gateway(%{field: value})
      {:ok, %Gateway{}}

      iex> create_gateway(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_gateway(attrs \\ %{}) do
    unique_id = :crypto.strong_rand_bytes(4)

    gateway_identifier_changeset = %GatewayIdentifier{}
      |> GatewayIdentifier.changeset(%{ unique_identifier: unique_id })

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:gateway_identifier, gateway_identifier_changeset)
      |> Ecto.Multi.run(:gateway, fn %{gateway_identifier: gateway_identifier} ->
        attrs = Map.merge(attrs, %{"gateway_identifier_id" => gateway_identifier.id})

        %Gateway{}
        |> Gateway.changeset(attrs)
        |> Repo.insert()
      end)
      |> Repo.transaction

    case result do
      {:ok, %{gateway: gateway, gateway_identifier: gateway_identifier}} -> {:ok, gateway}
      {:error, _, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  @doc """
  Updates a gateway.

  ## Examples

      iex> update_gateway(gateway, %{field: new_value})
      {:ok, %Gateway{}}

      iex> update_gateway(gateway, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_gateway(%Gateway{} = gateway, attrs) do
    gateway
    |> Gateway.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Gateway.

  ## Examples

      iex> delete_gateway(gateway)
      {:ok, %Gateway{}}

      iex> delete_gateway(gateway)
      {:error, %Ecto.Changeset{}}

  """
  def delete_gateway(%Gateway{} = gateway) do
    Repo.get!(GatewayIdentifier, gateway.gateway_identifier_id)
      |> Repo.delete
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking gateway changes.

  ## Examples

      iex> change_gateway(gateway)
      %Ecto.Changeset{source: %Gateway{}}

  """
  def change_gateway(%Gateway{} = gateway) do
    Gateway.changeset(gateway, %{})
  end

  def get_gateway_by_unique_identifier(id) do
    case Base.decode32(id) do
      {:ok, identifier} ->
        case Repo.get_by(GatewayIdentifier, unique_identifier: identifier) do
          gatewayIdentifier = %GatewayIdentifier{} -> gatewayIdentifier |> Repo.preload(:gateway)
          nil -> :error
        end
      :error -> :error
    end
  end
end
