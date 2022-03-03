defmodule Console.AuditActions.AuditAction do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "audit_actions" do
    field :organization_id, :string
    field :user_email, :string
    field :action, :string
    field :data, :map

    timestamps()
  end

  def changeset(audit_action, attrs \\ %{}) do
    audit_action
    |> cast(attrs, [:user_email, :action, :organization_id, :data])
  end

  def create_changeset(audit_action, attrs \\ %{}) do
    audit_action
    |> changeset(attrs)
  end
end
