defmodule ConsoleWeb.LabelController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels
  alias Console.Devices
  alias Console.Channels
  alias Console.Functions
  alias Console.Organizations
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"label" => label_params}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    label_params =
      Map.merge(label_params, %{
        "organization_id" => current_organization.id,
        "creator" => current_user.email
      })

    with {:ok, %Label{} = label} <- Labels.create_label(current_organization, label_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:labels_index_table", "graphql:labels_index_table:#{current_organization.id}:label_list_update", %{})

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Label #{label.name} added successfully")
      |> render("show.json", label: label)
    end
  end

  def update(conn, %{"id" => id, "label" => label_params}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id)
    name = label.name

    with {:ok, %Label{} = label} <- Labels.update_label(label, label_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})

      msg =
        cond do
          label.name == name -> "Label #{label.name} updated successfully"
          true -> "The label #{name} was successfully updated to #{label.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", label: label)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id) |> Labels.fetch_assoc([:devices])

    with {:ok, %Label{} = label} <- Labels.delete_label(label) do
      ConsoleWeb.Endpoint.broadcast("graphql:labels_index_table", "graphql:labels_index_table:#{current_organization.id}:label_list_update", %{})

      conn
      |> put_resp_header("message", "#{label.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"labels" => labels}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(List.first(labels))

    with {:ok, _} <- Labels.delete_labels(labels, current_organization.id) do
      ConsoleWeb.Endpoint.broadcast("graphql:labels_index_table", "graphql:labels_index_table:#{current_organization.id}:label_list_update", %{})

      conn
      |> put_resp_header("message", "Labels deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "labels" => labels, "to_label" => to_label}) do
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(current_organization, to_label)

    if length(devices) == 0 and length(labels) == 0 do
      {:error, :bad_request, "Please select a device or label"}
    else
      with {:ok, count, devices_labels} <- Labels.add_devices_to_label(devices, labels, destination_label.id, current_organization) do
        msg =
          case count do
            0 -> "All selected devices are already in label"
            _ -> "#{count} Devices added to label successfully"
          end

        ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{destination_label.id}:label_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{destination_label.id}:update_label_devices", %{})

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "to_label" => to_label}) do
    current_organization = conn.assigns.current_organization

    apply_label_to_devices(devices, to_label, current_organization, conn)
  end

  def add_devices_to_label(conn, %{"devices" => devices, "new_label" => label_name}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    create_label_and_apply_to_devices(devices, label_name, current_organization, current_user, conn)
  end

  def add_devices_to_label(conn, %{"to_label" => to_label}) do
    conn.assigns.current_organization.id
    |> Devices.get_devices()
    |> Enum.map(fn device -> device.id end)
    |> apply_label_to_devices(to_label, conn.assigns.current_organization, conn)
  end

  def add_devices_to_label(conn, %{"new_label" => label_name}) do
    conn.assigns.current_organization.id
    |> Devices.get_devices()
    |> Enum.map(fn device -> device.id end)
    |> create_label_and_apply_to_devices(
      label_name,
      conn.assigns.current_organization,
      conn.assigns.current_user,
      conn
    )
  end

  def delete_devices_from_labels(conn, %{"devices" => devices, "label_id" => label_id}) do
    current_organization = conn.assigns.current_organization

    with {_, nil} <- Labels.delete_devices_from_label(devices, label_id, current_organization) do
      label = Labels.get_label!(label_id)
      ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{label.id}:update_label_devices", %{})

      conn
      |> put_resp_header("message", "Device(s) successfully removed from label")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"labels" => labels, "device_id" => device_id}) do
    current_organization = conn.assigns.current_organization

    with {_, nil} <- Labels.delete_labels_from_device(labels, device_id, current_organization) do
      device = Devices.get_device!(device_id)
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device.id}:device_update", %{})

      conn
      |> put_resp_header("message", "Label(s) successfully removed from device")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"devices" => devices}) do
    current_organization = conn.assigns.current_organization

    with {:ok, devices} <- Labels.delete_all_labels_from_devices(devices, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      broadcast_router_update_devices(devices)

      conn
      |> put_resp_header("message", "All labels successfully removed from devices")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"labels" => labels}) do
    current_organization = conn.assigns.current_organization

    with {:ok, labels} <- Labels.delete_all_devices_from_labels(labels, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:labels_index_table", "graphql:labels_index_table:#{current_organization.id}:label_list_update", %{})

      assoc_labels = labels |> Labels.multi_fetch_assoc([:devices])
      assoc_devices = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq()
      broadcast_router_update_devices(assoc_devices)

      conn
      |> put_resp_header("message", "All devices successfully removed from labels")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, _params) do
    current_organization = conn.assigns.current_organization

    Labels.delete_all_labels_from_devices_for_org(current_organization)
    ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})

    conn
      |> put_resp_header("message", "All devices successfully removed from labels")
      |> send_resp(:no_content, "")
  end

  def debug(conn, %{"label" => label_id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, label_id)
    label = Labels.fetch_assoc(label, [:devices])
    devices = label.devices |> Enum.map(fn d -> d.id end)

    if length(devices) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:debug:devices", %{ "devices" => devices })
    end

    conn
    |> send_resp(:no_content, "")
  end

  def swap_label(conn, %{ "label_id" => label_id, "destination_label_id" => destination_label_id }) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, label_id) |> Labels.fetch_assoc([:devices])
    destination_label = Labels.get_label!(current_organization, destination_label_id)
    device_ids = label.devices |> Enum.map(fn d -> d.id end)

    with {:ok, _, _} <- Labels.add_devices_to_label(device_ids, destination_label.id, current_organization),
      {_, nil} <- Labels.delete_devices_from_label(device_ids, label_id, current_organization) do
        ConsoleWeb.Endpoint.broadcast("graphql:labels_index_table", "graphql:labels_index_table:#{current_organization.id}:label_list_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{label.id}:update_label_devices", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{destination_label.id}:update_label_devices", %{})

        conn
        |> put_resp_header("message", "Devices have been successfully swapped to new label")
        |> send_resp(:no_content, "")
    end
  end

  defp create_label_and_apply_to_devices(devices, label_name, organization, user, conn) do
    current_organization = conn.assigns.current_organization
    cond do
      length(devices) == 0 -> {:error, :bad_request, "Please select a device"}
      Labels.get_label_by_name(String.upcase(label_name), organization.id) != nil -> {:error, :bad_request, "That label already exists"}
      true ->
        label_changeset =
          %Label{}
          |> Label.changeset(%{"name" => label_name, "organization_id" => organization.id, "creator" => user.email})

        result =
          Ecto.Multi.new()
          |> Ecto.Multi.insert(:label, label_changeset)
          |> Ecto.Multi.run(:devices_labels, fn _repo, %{label: label} ->
            with {:ok, count, _} <- Labels.add_devices_to_label(devices, label.id, organization) do
              {:ok, {label, count}}
            end
          end)
          |> Repo.transaction()

        with {:ok, %{devices_labels: {_, count}, label: label }} <- result do
          ConsoleWeb.Endpoint.broadcast("graphql:labels_index_table", "graphql:labels_index_table:#{conn.assigns.current_organization.id}:label_list_update", %{})
          device = Devices.get_device!(List.first(devices))
          ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})

          broadcast_router_update_devices(label)

          conn
          |> put_resp_header("message", "#{count} Devices added to label successfully")
          |> send_resp(:no_content, "")
        end
    end
  end

  defp apply_label_to_devices(devices, label_id, organization, conn) do
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(organization, label_id)

    if length(devices) == 0 do
      {:error, :bad_request, "Please select a device"}
    else
      with {:ok, count, devices_labels} <- Labels.add_devices_to_label(devices, destination_label.id, organization) do
        msg =
          case count do
            0 -> "All selected devices are already in label"
            _ -> "#{count} Devices added to label successfully"
          end

        device = Devices.get_device!(List.first(devices))

        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{destination_label.id}:update_label_devices", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device.id}:device_update", %{})

        assoc_devices = devices_labels |> Enum.map(fn dl -> dl.device_id end)
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_devices })

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
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
end
