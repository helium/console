defmodule Console.AuditTrails do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.AuditTrails.AuditTrail

  def list_audit_trails do
    Repo.all(AuditTrail)
  end

  def create_audit_trail(object, action, user \\ %{}, team \\ %{}, target_table \\ nil, target \\ %{}) do
    attrs = generate_audit_attrs(object, action, user, team, target_table, target)

    %AuditTrail{}
    |> AuditTrail.changeset(attrs)
    |> Repo.insert()
  end

  defp generate_audit_attrs(object, action, user = %{id: user_id, email: user_email}, team = %{}, nil, target = %{}) do
    %{
      user_id: user_id,
      user_email: user_email,
      object: object,
      action: action,
      description: generate_description(object, action, user, team, target)
    }
  end
  defp generate_audit_attrs(object, action, user = %{id: user_id, email: user_email}, team = %{id: team_id}, nil, target = %{}) do
    %{
      user_id: user_id,
      user_email: user_email,
      object: object,
      action: action,
      description: generate_description(object, action, user, team, target),
      team_id: team_id
    }
  end
  defp generate_audit_attrs(object, action, user = %{id: user_id, email: user_email}, team = %{id: team_id}, target_table, target = %{id: target_id}) do
    %{
      user_id: user_id,
      user_email: user_email,
      object: object,
      action: action,
      description: generate_description(object, action, user, team, target),
      team_id: team_id,
      target_table: target_table,
      target_id: target_id
    }
  end

  defp generate_description(object, action, user, team, target) do
    case object do
      "user_account" ->
        case action do
          "register" -> "#{user.email} registered as a brand new user"
          "register_from_invite" -> "#{user.email} registered with an invite from #{target.email} to join team: #{team.name}"
          "resend_verification_email" -> "#{user.email} requested an account verification email resend"
          "activate_account" -> "#{user.email} verified and activated his/her account"
          "request_password_reset" -> "#{user.email} requested a reset password link"
          "use_password_reset_link" -> "#{user.email} used his/her password reset link"
          "change_password" -> "#{user.email} changed his/her password"
          "login" -> "#{user.email} logged in"
        end
      "team" ->
        case action do
          "create" -> "#{user.email} created team: #{team.name} as a brand new user"
        end
    end
  end
end
