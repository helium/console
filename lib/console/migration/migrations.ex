defmodule Console.Migrations do
  import Ecto.Query, warn: false
  alias Console.Repo

  def get_applications(api_key, tenant_id) do
    header = [{"Authorization", "Bearer #{api_key}"}]
    "http://router2.helium.wtf:8096/api/applications?tenantId=#{tenant_id}&limit=1000&offset=0"
      |> HTTPoison.get!(header)
      |> Map.get(:body)
      |> Poison.decode!()
      |> Map.get("result")
  end

  def get_all_devices(api_key, application_id, offset, acc) do
    header = [{"Authorization", "Bearer #{api_key}"}]
    result = "http://router2.helium.wtf:8096/api/devices?applicationId=#{application_id}&limit=1000&offset=#{offset}"
      |> HTTPoison.get!(header)
      |> Map.get(:body)
      |> Poison.decode!()
      |> Map.get("result")

    if length(result) > 0 do
      get_all_devices(api_key, application_id, offset + 1000, acc ++ result)
    else
      acc
    end
  end

  def get_device_details(api_key, dev_eui) do
    header = [{"Authorization", "Bearer #{api_key}"}]
    "http://router2.helium.wtf:8096/api/devices/#{dev_eui}"
      |> HTTPoison.get!(header)
      |> Map.get(:body)
      |> Poison.decode!()
  end
end
