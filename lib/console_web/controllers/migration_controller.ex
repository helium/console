defmodule ConsoleWeb.MigrationController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Devices
  alias Console.Labels
  alias Console.Devices.Device
  alias Console.Labels
  alias Console.Migrations

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def get_applications(conn, %{"api_key" => api_key, "tenant_id" => tenant_id} = attrs) do
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

    response = %{
      labels: labels,
      applications: applications
    }

    conn |> send_resp(200, Poison.encode!(response))
  end

  def get_devices(conn, %{"label_id" => label_id} = attrs) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label(current_organization, label_id)
    case label do
      nil ->
        conn |> send_resp(400, "")
      _ ->
        devices =
          Devices.get_devices_for_label(label.id)
          |> Enum.map(fn d ->
            Map.merge(d, %{ region: nil, live_migratable: true, migration_status: false })
          end)
          |> Enum.sort(&(Map.get(&1, :name) < Map.get(&2, :name)))

        conn |> send_resp(200, Poison.encode!(devices))
    end
  end
end
