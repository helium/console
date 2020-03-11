defmodule ConsoleWeb.V1.LabelController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query

  alias Console.Organizations
  alias Console.Devices
  alias Console.Labels
  alias Console.Labels.Label
  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:labels])

    render(conn, "index.json", labels: current_organization.labels)
  end

  def add_device_to_label(conn, %{ "label" => label_id, "device" => device_id}) do
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(current_organization, label_id)
    device = Devices.get_device!(current_organization, device_id)

    with {:ok, count} <- Labels.add_devices_to_label([device.id], destination_label.id, current_organization) do
      msg =
        case count do
          0 -> "Device has already been added to label"
          _ -> "Device added to label successfully"
        end

        conn
        |> send_resp(:ok, msg)
    end
  end

  def delete_device_from_label(conn, %{ "label" => label_id, "device" => device_id}) do
    current_organization = conn.assigns.current_organization
    device = Devices.get_device!(current_organization, device_id)
    label = Labels.get_label!(current_organization, label_id)

    with {count, nil} <- Labels.delete_devices_from_label([device.id], label.id, current_organization) do
      msg =
        case count do
          0 -> "Device was not in label"
          _ -> "Device removed from label successfully"
        end

        conn
        |> send_resp(:ok, msg)
    end
  end
end
