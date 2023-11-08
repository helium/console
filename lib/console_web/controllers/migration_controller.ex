defmodule ConsoleWeb.MigrationController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Devices
  alias Console.Labels
  alias Console.Devices.Device
  alias Console.Labels

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

    response = %{
      labels: labels,
      applications: [%{
        name: "app1",
        id: "app1"
      },%{
        name: "app2",
        id: "app2"
      }]
    }

    conn |> send_resp(200, Poison.encode!(response))
  end

  def get_devices(conn, %{"api_key" => api_key, "tenant_id" => tenant_id} = attrs) do
    current_organization = conn.assigns.current_organization
    user = conn.assigns.current_user

    conn |> send_resp(200, "")
  end
end
