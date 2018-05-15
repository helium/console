defmodule Console.AuditTrails do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.AuditTrails.AuditTrail

  def list_audit_trails do
    Repo.all(AuditTrail)
  end

  def create_audit_trail(object, action, user \\ %{}, team \\ %{}, target_table \\ false, target \\ %{}) do
    attrs = generate_audit_attrs(object, action, user, team, target_table, target)

    %AuditTrail{}
    |> AuditTrail.changeset(attrs)
    |> Repo.insert()
  end

  defp generate_audit_attrs(object, action, user, team, target_table, target) do
    cond do
      object == "user account" ->
        generate_user_account_attrs(object, action, user, team)
      object == "team" ->
        generate_team_attrs(object, action, user, team)
    end
  end

  defp generate_user_account_attrs(object, action, user, team) do
    case action do
      "register" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} registered as a brand new user",
          team_id: team.id,
          team_name: team.name
        }
    end
  end

  defp generate_team_attrs(object, action, user, team) do
    case action do
      "create" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} created team #{team.name} as a brand new user",
          team_id: team.id,
          team_name: team.name
        }
    end
  end
end
