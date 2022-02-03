defmodule ConsoleWeb.V1.LabelController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Organizations
  alias Console.Devices
  alias Console.Labels
  alias Console.Labels.Label
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, %{ "name" => name }) do
    current_organization = conn.assigns.current_organization

    case Labels.get_label_by_name(name, current_organization.id)
      |> Repo.preload([:config_profile])
    do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = label ->
        render(conn, "show.json", label: put_config_settings_on_label(label))
    end
  end

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc(labels: [:config_profile])
    labels = Enum.map(current_organization.labels, fn l -> put_config_settings_on_label(l) end)

    render(conn, "index.json", labels: labels)
  end

  def show(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Labels.get_label(current_organization, id)
      |> Repo.preload([:config_profile])
    do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = label ->
        render(conn, "show.json", label: put_config_settings_on_label(label))
    end
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
      |> render("show.json", label: Map.merge(label, %{ cf_list_enabled: false, adr_allowed: false, rx_delay: nil }))
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization

    case Labels.get_label(current_organization, id) do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = label ->
        with {:ok, _} <- Labels.delete_label(label) do
          broadcast_router_update_devices(label)

          conn
          |> send_resp(:ok, "Label deleted")
        end
    end
  end

  def add_device_to_label(conn, %{ "label" => label_id, "device_id" => device_id}) do
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(current_organization, label_id)
    device = Devices.get_device!(current_organization, device_id)

    with {:ok, _} <- Labels.add_devices_to_label([device.id], destination_label.id, current_organization) do
      conn
      |> send_resp(:ok, "Device added to label successfully")
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
          _ ->
            broadcast_router_update_devices([device])
            "Device removed from label successfully"
        end

        conn
        |> send_resp(:ok, msg)
    end
  end

  defp broadcast_router_update_devices(%Label{} = label) do
    assoc_device_ids = label |> Labels.fetch_assoc([:devices]) |> Map.get(:devices) |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end

  defp broadcast_router_update_devices(devices) do
    assoc_device_ids = devices |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end

  defp put_config_settings_on_label(label) do
    adr_allowed =
      case label.config_profile do
        nil -> false
        _ -> label.config_profile.adr_allowed
      end

    cf_list_enabled =
      case label.config_profile do
        nil -> false
        _ -> label.config_profile.cf_list_enabled
      end

    rx_delay =
      case label.config_profile do
        nil -> nil
        _ -> label.config_profile.rx_delay
      end

    Map.merge(label, %{ cf_list_enabled: cf_list_enabled, adr_allowed: adr_allowed, rx_delay: rx_delay })
  end
end
