defmodule Console.Teams.Invitation do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "invitations" do
    field :email, :string
    field :role, :string
    field :token, :string
    field :pending, :boolean, default: true
    belongs_to :inviter, Console.Auth.User
    belongs_to :organization, Console.Teams.Organization

    timestamps()
  end

  @doc false
  def changeset(invitation, attrs \\ %{}) do
    invitation
    |> cast(attrs, [:email, :role, :organization_id, :inviter_id])
    |> validate_required([:organization_id])
    |> validate_required(:email, message: "Email is required")
    |> validate_format(:email, ~r/@/, message: "Email is invalid")
    |> validate_required(:role, message: "Role is required")
    |> unique_constraint(:email, name: :invitations_email_team_id_index, message: "That email has already been invited to this team")
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
end
