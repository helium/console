defmodule ConsoleWeb.V1.LabelController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query

  alias Console.Organizations
  alias Console.Devices
  alias Console.Auth
  alias Console.Labels
  alias Console.Labels.Label
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:labels])

    render(conn, "index.json", labels: current_organization.labels)
  end

  def create(conn, label_params = %{ "name" => _name }) do
    current_organization = conn.assigns.current_organization

    label_params =
      Map.merge(label_params, %{
        "organization_id" => current_organization.id,
        "creator" => conn.assigns.user_id
      })

    with {:ok, %Label{} = label} <- Labels.create_label(current_organization, label_params) do
      conn
      |> put_status(:created)
      |> render("show.json", label: label)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization

    case Labels.get_label(current_organization, id) do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = label ->
        with {:ok, _} <- Labels.delete_label(label) do
          conn
          |> send_resp(:ok, "Label deleted")
        end
    end
  end

  def add_device_to_label(conn, %{ "label" => label_id, "device_id" => device_id}) do
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(current_organization, label_id)
    device = Devices.get_device!(current_organization, device_id)

    with {:ok, count, _} <- Labels.add_devices_to_label([device.id], destination_label.id, current_organization) do
      msg =
        case count do
          0 -> "Device has already been added to label"
          _ -> "Device added to label successfully"
        end

        conn
        |> send_resp(:ok, msg)
    end
  end

  def delete_device_from_label(conn, %{ "label_id" => label_id, "device_id" => device_id}) do
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
