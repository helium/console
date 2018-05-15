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

  defp generate_audit_attrs(object, action, user, team, target_table, target) do
    cond do
      object == "user_account" ->
        generate_user_account_attrs(object, action, user, team, target_table, target)
      object == "team" ->
        generate_team_attrs(object, action, user, team)
    end
  end

  defp generate_user_account_attrs(object, action, user, team, target_table, target) do
    case action do
      "register" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} registered as a brand new user",
          team_id: team.id
        }
      "register_from_invite" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} registered with an invite from #{target.email} to join team: #{team.name}",
          team_id: team.id,
          target_table: target_table,
          target_id: target.id
        }
      "resend_verification_email" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} requested an account verification email resend"
        }
      "activate_account" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} verified and activated his/her account"
        }
      "request_password_reset" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} requested a reset password link"
        }
      "use_password_reset_link" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} used his/her password reset link"
        }
      "change_password" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} changed his/her password"
        }
      "login" ->
        %{
          user_id: user.id,
          user_email: user.email,
          object: object,
          action: action,
          description: "#{user.email} logged in"
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
          description: "#{user.email} created team: #{team.name} as a brand new user",
          team_id: team.id
        }
    end
  end
end
