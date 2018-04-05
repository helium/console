defmodule Console.Gateways do
  @moduledoc """
  The Gateways context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Gateways.Gateway

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
    %Gateway{}
    |> Gateway.changeset(attrs)
    |> Repo.insert()
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
    Repo.delete(gateway)
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
end
