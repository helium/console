defmodule Console.AuditActions do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.AuditActions.AuditAction

  def create_audit_action(organization_id, user_email, action, data) do
    attrs =
      %{
        "organization_id" => organization_id,
        "user_email" => user_email,
        "action" => action,
        "data" => data
      }

    Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
      %AuditAction{}
      |> AuditAction.create_changeset(attrs)
      |> Repo.insert()
    end)
  end
end
