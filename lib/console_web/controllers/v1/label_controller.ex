defmodule ConsoleWeb.V1.LabelController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Organizations
  alias Console.Devices
  alias Console.ConfigProfiles
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

      result =
        Ecto.Multi.new()
        |> Ecto.Multi.run(:config_profile, fn _repo, _ ->
          profile_id = Map.get(label_params, "config_profile_id", nil)
          if profile_id != nil do
            config_profile = ConfigProfiles.get_config_profile(current_organization, profile_id)
            if config_profile != nil do
              {:ok, config_profile}
            else
              {:error, "Could not find Config Profile in organization"}
            end
          else
            {:ok, nil}
          end
        end)
        |> Ecto.Multi.run(:label, fn _repo, %{ config_profile: config_profile } ->
          label_attrs =
            if config_profile != nil do
              label_params
            else
              label_params |> Map.drop(["config_profile_id"])
            end
          Labels.create_label(current_organization, label_attrs)
        end)
        |> Repo.transaction()

      case result do
        {:ok, %{ label: label }} ->
          label = label |> Repo.preload([:config_profile])

          conn
          |> put_status(:created)
          |> render("show.json", label: put_config_settings_on_label(label))
        {:error, _, error = %Ecto.Changeset{}, _} ->
          {:error, error}
        {:error, _, error, _} ->
          {:error, :bad_request, error}
      end
  end

  def update(conn, %{ "id" => id, "config_profile_id" => profile_id }) do
    current_organization = conn.assigns.current_organization

    case Labels.get_label(current_organization, id) do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = label ->
        if profile_id == nil do
          with {:ok, label} <- Labels.update_label(label, %{ config_profile_id: nil }) do
            label = label |> Repo.preload([:config_profile])
            broadcast_router_update_devices(label)

            render(conn, "show.json", label: put_config_settings_on_label(label))
          end
        else
          config_profile = ConfigProfiles.get_config_profile(current_organization, profile_id)
          case config_profile do
            nil ->
              {:error, :not_found, "Config Profile not found"}
            _ ->
              with {:ok, label} <- Labels.update_label(label, %{ config_profile_id: config_profile.id }) do
                label = label |> Repo.preload([:config_profile])
                broadcast_router_update_devices(label)

                render(conn, "show.json", label: put_config_settings_on_label(label))
              end
          end
        end
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
