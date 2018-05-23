defmodule Console.AuditTrails do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.AuditTrails.AuditTrail

  def list_audit_trails do
    Repo.all(AuditTrail)
  end

  def create_audit_trail(object, action, user \\ nil, team \\ nil, target_table \\ nil, target \\ nil) do
    attrs = generate_audit_attrs(object, action, user, team, target_table, target)

    %AuditTrail{}
    |> AuditTrail.changeset(attrs)
    |> Repo.insert()
  end

  defp generate_audit_attrs(object, action, user = %{id: user_id, email: user_email}, team = nil, nil, target = nil) do
    %{
     user_id: user_id,
     user_email: user_email,
     object: object,
     action: action,
     description: generate_description(object, action, user, team, target)
    }
  end
  defp generate_audit_attrs(object, action, user = %{id: user_id, email: user_email}, team = %{id: team_id}, nil, target = nil) do
    %{
      user_id: user_id,
      user_email: user_email,
      object: object,
      action: action,
      description: generate_description(object, action, user, team, target),
      team_id: team_id
    }
  end
  defp generate_audit_attrs(object, action, user = %{id: user_id, email: user_email}, team = %{id: team_id}, nil, target) do
    %{
      user_id: user_id,
      user_email: user_email,
      object: object,
      action: action,
      description: generate_description(object, action, user, team, target),
      team_id: team_id
    }
  end
  defp generate_audit_attrs(object, action, user = nil, team = %{id: team_id}, nil, target) do
    %{
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
          "register_from_invite" -> "#{user.email} registered with an invite from #{target.email}"
          "resend_verification_email" -> "#{user.email} requested an account verification email resend"
          "activate_account" -> "#{user.email} verified and activated his/her account"
          "request_password_reset" -> "#{user.email} requested a reset password link"
          "use_password_reset_link" -> "#{user.email} used his/her password reset link"
          "change_password" -> "#{user.email} changed his/her password"
          "login" -> "#{user.email} logged in"
        end
      "team" ->
        case action do
          "create" -> "#{user.email} created team: #{team.name}"
        end
      "two_factor" ->
        case action do
          "activate" -> "#{user.email} activated 2fa"
          "authenticate" -> "#{user.email} authenticated successfully with 2fa"
          "skip_activation" -> "#{user.email} skipped activation of 2fa"
        end
      "team_membership" ->
        case action do
          "update" -> "#{user.email} changed #{target.email} to #{target.role}"
          "delete" -> "#{user.email} removed #{target.email} from the team"
          "join" -> "#{user.email} joined the team as #{user.role}"
        end
      "team_invitation" ->
        case action do
          "create_existing" -> "#{user.email} invited existing user #{target.email} to the team as #{target.role}"
          "create_new" -> "#{user.email} invited new user #{target.email} to the team as #{target.role}"
          "delete" -> "#{user.email} deleted an invitation to #{target.email}"
          "use_invite_link" -> "#{target.email} used his/her team invitation link"
        end
      "gateway" ->
        case action do
          "create" -> "#{user.email} created gateway #{target.name}"
          "update" -> "#{user.email} updated gateway #{target.name}"
          "delete" -> "#{user.email} deleted gateway #{target.name}"
        end
      "device" ->
        case action do
          "create" -> "#{user.email} created device #{target.name}"
          "update" -> "#{user.email} updated device #{target.name}"
          "delete" -> "#{user.email} deleted device #{target.name}"
        end
      "channel" ->
        case action do
          "create" -> "#{user.email} created channel #{target.name}"
          "update" -> "#{user.email} updated channel #{target.name}"
          "delete" -> "#{user.email} deleted channel #{target.name}"
        end
    end
  end
end
