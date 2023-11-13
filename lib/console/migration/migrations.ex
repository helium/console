defmodule Console.Migrations do
  import Ecto.Query, warn: false
  alias Console.Repo

  def get_applications(api_key, tenant_id) do
    header = [{"Authorization", "Bearer #{api_key}"}, {"Host", "router2.helium.wtf"}]
    "http://router2.helium.wtf:8096/api/applications?tenantId=#{tenant_id}&limit=1000&offset=0"
      |> HTTPoison.get!(header)
      |> Map.get(:body)
      |> Poison.decode!()
      |> Map.get("result")
  end
end
