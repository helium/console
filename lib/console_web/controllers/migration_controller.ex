defmodule ConsoleWeb.MigrationController do
  use ConsoleWeb, :controller

  alias Console.Devices
  alias Console.Labels
  alias Console.Migrations

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def get_applications(conn, %{"api_key" => api_key, "tenant_id" => tenant_id}) do
    current_organization = conn.assigns.current_organization
    labels =
      Labels.get_all_organization_labels(current_organization.id)
      |> Enum.map(fn label ->
        %{
          name: label.name,
          id: label.id
        }
      end)

    applications = Migrations.get_applications(api_key, tenant_id)

    case applications do
      nil ->
        conn |> send_resp(400, Poison.encode!(%{ errors: %{ error: "Could not fetch applications, please check your credentials and try again" }}))
      _ ->
        response = %{
          labels: labels,
          applications: applications
        }

        conn |> send_resp(200, Poison.encode!(response))
    end
  end

  def get_devices(conn, %{"label_id" => label_id, "api_key" => api_key, "tenant_id" => tenant_id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label(current_organization, label_id)
    case label do
      nil ->
        conn |> send_resp(400, "")
      _ ->
        application_ids =
          Migrations.get_applications(api_key, tenant_id)
          |> Enum.map(fn app -> app["id"] end)

        chirpstack_devices_map =
          Enum.reduce(application_ids, [], fn app_id, acc ->
            acc ++ Migrations.get_all_devices(api_key, app_id, 0, [])
          end)
          |> Enum.reduce(%{}, fn device, acc ->
            chirpstack_device =
              Migrations.get_device_details(api_key, device["devEui"])
              |> Map.merge(device)

            Map.put(acc, "#{device["devEui"]}-#{chirpstack_device["device"]["joinEui"]}", true)
          end)

        console_devices = Devices.get_devices_for_label(label.id)

        request_id = for _ <- 1..10, into: "", do: <<Enum.random('0123456789abcdef')>>
        :persistent_term.put(request_id, self())
        ids = Enum.map(console_devices, fn device -> device.id end)
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:skf", %{"devices" => ids, "request_id" => request_id})

        # receive do
        #   {:skf, request_id, skfs} ->
        #     :persistent_term.erase(request_id)
        skfs = %{
          "f54a370f-5792-4e74-ad1e-635b864c45af" => %{
            "app_s_key" => "EF0DB9A1694449FD2CF760470DD5D491",
            "devaddr" => "48000401",
            "nwk_s_key" => "FC4066B2BC188396BC0229E2909AF74F",
            "region" => "EU868"
          },
          "b4f10929-ed55-469d-bc6f-9b69f5d9eb07" => %{
            "app_s_key" => "EF0DB9A1694449FD2CF760470DD5D492",
            "devaddr" => "48000402",
            "nwk_s_key" => "FC4066B2BC188396BC0229E2909AF742",
            "region" => "US915"
          },
          "7e762bef-eee4-4f39-b30d-e79707dabe34" => %{
            "app_s_key" => "EF0DB9A1694449FD2CF760470DD5D493",
            "devaddr" => "48000403",
            "nwk_s_key" => "FC4066B2BC188396BC0229E2909AF743",
            "region" => "US915"
          },
        }


            devices =
              console_devices
              |> Enum.map(fn device ->
                migration_status = Map.get(chirpstack_devices_map, String.downcase("#{device.dev_eui}-#{device.app_eui}"), false)

                device_skf = Map.get(skfs, device.id, %{})
                region = Map.get(device_skf, "region", nil)
                region = if region == "undefined" do nil else region end
                devaddr = Map.get(device_skf, "devaddr", nil)
                nwk_s_key = Map.get(device_skf, "nwk_s_key", nil)
                app_s_key = Map.get(device_skf, "app_s_key", nil)
                live_migratable = not is_nil(region) and not is_nil(devaddr) and not is_nil(nwk_s_key) and not is_nil(app_s_key)

                Map.merge(device, %{
                  region: region,
                  devaddr: devaddr,
                  nwk_s_key: nwk_s_key,
                  app_s_key: app_s_key,
                  live_migratable: live_migratable,
                  migration_status: migration_status
                })
              end)
              |> Enum.sort(&(Map.get(&1, :name) < Map.get(&2, :name)))

            conn |> send_resp(200, Poison.encode!(devices))
        # after
        #   3_000 ->
        #     :persistent_term.erase(request_id)
        #
        #     {:error, :internal_server_error, "Could not fetch SKFs"}
        # end
    end
  end

  def create_device(conn, %{
      "device_id" => device_id,
      "label_id" => label_id,
      "api_key" => api_key,
      "tenant_id" => tenant_id,
      "application_id" => application_id,
      "migration_status" => migration_status,
      "region" => region,
      "devaddr" => devaddr,
      "nwk_s_key" => nwk_s_key,
      "app_s_key" => app_s_key})
  do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, device_id)
    label = Labels.get_label!(current_organization, label_id)
    device_profile_name = "#{label.name}_#{region}"

    case migration_status do
      true ->
        conn |> send_resp(200, "")

      _ ->
        device_profile_id = Migrations.get_device_profile_by_region(api_key, tenant_id, region, device_profile_name)
        active = device.active

        with {:ok, _} <- Devices.update_device(device, %{ active: false }),
          :ok <- Migrations.create_device(api_key, device, application_id, device_profile_id, active),
          :ok <- Migrations.activate_device(api_key, device, devaddr, nwk_s_key, app_s_key),
          :ok <- Migrations.create_device_keys(api_key, device) do

          ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => [device.id] })

          conn |> send_resp(200, "")
        else
          _ ->
            conn |> send_resp(502, "")
        end
    end
  end
end
