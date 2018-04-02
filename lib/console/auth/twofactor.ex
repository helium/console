defmodule Console.Auth.TwoFactor do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Auth.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "twofactors" do
    field :secret, Cloak.EncryptedBinaryField
    field :encryption_version, :binary
    field :last_verified, :naive_datetime
    field :last_skipped, :naive_datetime
    field :backup_codes, {:array, :string}
    belongs_to(:user, User)
  end

  def enable_changeset(twoFactor, attrs \\ %{}) do
    twoFactor
    |> cast(attrs, [:secret, :user_id])
    |> put_change(:backup_codes, attrs.codes)
    |> put_change(:encryption_version, Cloak.version)
    |> validate_required([:secret, :user_id, :backup_codes])
  end

  def remove_used_backup_code_changeset(twoFactor, newCodes, attrs \\ %{}) do
    twoFactor
    |> cast(attrs, [:secret, :user_id])
    |> put_change(:backup_codes, newCodes)
    |> validate_required([:secret, :user_id, :backup_codes])
  end
end
