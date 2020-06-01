defmodule Console.Organizations.Invitation do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "invitations" do
    field :email, :string
    field :role, :string
    field :token, :string
    field :pending, :boolean, default: true
    field :inviter_id, :string
    belongs_to :organization, Console.Organizations.Organization

    timestamps()
  end

  @doc false
  def changeset(invitation, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["email", "role"])
    attrs = downcase_email(attrs)

    invitation
    |> cast(attrs, [:email, :role, :organization_id, :inviter_id])
    |> validate_required([:organization_id, :inviter_id])
    |> validate_required(:email, message: "Email is required")
    |> validate_format(:email, ~r/@/, message: "Email is invalid")
    |> validate_required(:role, message: "Role is required")
    |> validate_inclusion(:role, ~w(admin manager read))
    |> unique_constraint(:email, name: :invitations_email_organization_id_index, message: "That email has already been invited to this organization")
  end

  def create_changeset(invitation, attrs) do
    invitation
    |> changeset(attrs)
    |> put_token()
  end

  def used_changeset(invitation) do
    invitation
    |> changeset()
    |> put_change(:pending, false)
  end

  defp put_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :token, generate_token(64))
      _ -> changeset
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end

  defp downcase_email(attrs) do
    case Map.get(attrs, "email") do
      nil -> attrs
      email -> Map.put(attrs, "email", String.downcase(email))
    end
  end
end
