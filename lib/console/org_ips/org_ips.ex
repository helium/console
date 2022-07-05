defmodule Console.OrgIps do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.OrgIps.OrgIp

  def create_org_ip(attrs = %{}) do
    %OrgIp{}
    |> OrgIp.create_changeset(attrs)
    |> Repo.insert()
  end
end
