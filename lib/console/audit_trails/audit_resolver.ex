defmodule Console.Devices.AuditResolver do
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Console.AuditTrails

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    audit_trails =
      Ecto.assoc(current_team, :audit_trails)
      |> order_by([desc: :updated_at])
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, audit_trails}
  end
end
