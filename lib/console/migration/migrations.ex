defmodule Console.Migrations do
  import Ecto.Query, warn: false
  alias Console.Repo

  def get_applications(api_key, tenant_id) do
    "http://router2.helium.wtf:8096/api/applications?tenantId=#{tenant_id}&limit=1000&offset=0"
      |> HTTPoison.get!([{"Authorization", "Bearer #{api_key}"}])
      |> Map.get(:body)
      |> Poison.decode!()
      |> Map.get("result")
  end

  def get_all_devices(api_key, application_id, offset, acc) do
    result = "http://router2.helium.wtf:8096/api/devices?applicationId=#{application_id}&limit=1000&offset=#{offset}"
      |> HTTPoison.get!([{"Authorization", "Bearer #{api_key}"}])
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
    "http://router2.helium.wtf:8096/api/devices/#{dev_eui}"
      |> HTTPoison.get!([{"Authorization", "Bearer #{api_key}"}])
      |> Map.get(:body)
      |> Poison.decode!()
  end

  def get_device_profile_by_region(api_key, tenant_id, region) do
    device_profiles =
      "http://router2.helium.wtf:8096/api/device-profiles?tenantId=#{tenant_id}&limit=1000&offset=0"
        |> HTTPoison.get!([{"Authorization", "Bearer #{api_key}"}])
        |> Map.get(:body)
        |> Poison.decode!()
        |> Map.get("result")

    case Enum.find(device_profiles, fn dp -> dp["region"] == region end) do
      nil ->
        body = %{
          "device_profile" => %{
            "id" => Ecto.UUID.generate(),
            "region" => region,
            "tenant_id" => tenant_id,
            "name" => region,
            "description" => "Generated device profile for #{region}",
            "adr_algorithm_id" => "default",
            "supports_otaa" => true
          }
        } |> Poison.encode!()

        profile = "http://router2.helium.wtf:8096/api/device-profiles"
            |> HTTPoison.post!(body, [{"Authorization", "Bearer #{api_key}"}, {"content-type", "application/json"}])
            |> Map.get(:body)
            |> Poison.decode!()

        profile["id"]

      profile ->
        profile["id"]
    end
  end

  def create_device(api_key, device, application_id, device_profile_id) do
    body = %{
      "device" => %{
        "applicationId" => application_id,
        "deviceProfileId" => device_profile_id,
        "devEui" => device.dev_eui,
        "joinEui" => device.app_eui,
        "isDisabled" => device.active,
        "name" => device.name,
        "skipFcntCheck" => true,
        "description" => "Console Device ID: #{device.id}"
      }
    } |> Poison.encode!()

    response = "http://router2.helium.wtf:8096/api/devices"
      |> HTTPoison.post!(body, [{"Authorization", "Bearer #{api_key}"}, {"content-type", "application/json"}])

    case response.status_code do
      200 -> :ok
      _ -> :error
    end
  end
end
