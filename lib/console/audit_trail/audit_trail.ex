defmodule Console.AuditTrails.AuditTrail do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "audit_trails" do
    field(:user_email, :string)
    field(:object, :string)
    field(:action, :string)
    field(:description, :string)
    field(:target_table, :string)
    field(:target_id, :binary_id)
    belongs_to(:user, Console.Auth.User)
    belongs_to(:team, Console.Teams.Team)

    timestamps()
  end

  def changeset(audit_trail, attrs) do
    audit_trail
    |> cast(attrs, [
      :user_id,
      :user_email,
      :object,
      :action,
      :description,
      :team_id,
      :target_table,
      :target_id,
    ])
    |> validate_required([:object])
    |> validate_required([:action])
    |> validate_required([:description])
  end
end
