defmodule Console.Devices.AuditResolver do
  import Ecto.Query, warn: false
  
  alias Console.Repo
  alias Console.AuditTrails

  def all(_, %{context: %{current_team: current_team}}) do
    # audit_trails = AuditTrails.list_audit_trails
    audit_trails =
      Ecto.assoc(current_team, :audit_trails)
      |> order_by([desc: :updated_at])
      |> Repo.all()

    {:ok, audit_trails}
  end
end
