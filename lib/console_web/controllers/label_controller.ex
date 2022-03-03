defmodule ConsoleWeb.LabelController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels
  alias Console.Devices
  alias Console.Labels.Label
  alias Console.Alerts
  alias Console.AuditActions

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"label" => label_params} = attrs) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    label_params =
      Map.merge(label_params, %{
        "organization_id" => current_organization.id,
        "creator" => current_user.email
      })

    with {:ok, %Label{} = label} <- Labels.create_label(current_organization, label_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})

      AuditActions.create_audit_action(
        current_organization.id,
        current_user.email,
        "label_controller_create",
        label.id,
        attrs
      )

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Label #{label.name} added successfully")
      |> render("show.json", label: label)
    end
  end

  def update(conn, %{"id" => id, "label" => label_params} = attrs) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id) |> Labels.fetch_assoc([:devices])
    device_ids = label.devices |> Enum.map(fn d -> d.id end)
    name = label.name

    with {:ok, %Label{} = label} <- Labels.update_label(label, label_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:resources_update", "graphql:resources_update:#{current_organization.id}:organization_resources_update", %{})
      broadcast_router_update_devices(device_ids)

      msg =
        cond do
          label.name == name -> "Label #{label.name} updated successfully"
          true -> "The label #{name} was successfully updated to #{label.name}"
        end

      AuditActions.create_audit_action(
        current_organization.id,
        conn.assigns.current_user.email,
        "label_controller_update",
        label.id,
        attrs
      )

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", label: label)
    end
  end

  def delete(conn, %{"id" => id} = attrs) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id) |> Labels.fetch_assoc([:devices])
    device_ids = label.devices |> Enum.map(fn d -> d.id end)

    with {:ok, %Label{} = label} <- Labels.delete_label(label) do
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
      Alerts.delete_alert_nodes(id, "label")
      Enum.each(device_ids, fn device ->
        ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
      end)
      broadcast_router_update_devices(device_ids)

      AuditActions.create_audit_action(
        current_organization.id,
        conn.assigns.current_user.email,
        "label_controller_delete",
        id,
        attrs
      )

      conn
      |> put_resp_header("message", "#{label.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "labels" => labels, "to_label" => to_label}) do
    # individual label show dropdown - add this label to a device
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(current_organization, to_label)

    if length(devices) == 0 and length(labels) == 0 do
      {:error, :bad_request, "Please select a device or label"}
    else
      with {:ok, _devices_labels} <- Labels.add_devices_to_label(devices, labels, destination_label.id, current_organization) do
        ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{destination_label.id}:label_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{destination_label.id}:update_label_devices", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
        Enum.each(devices, fn device ->
          ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
        end)
        broadcast_router_update_devices(devices)

        conn
        |> put_resp_header("message", "Devices added to label successfully")
        |> send_resp(:ok, "")
      end
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "to_label" => to_label}) do
    # device index dropdown - add label to selected devices
    current_organization = conn.assigns.current_organization

    apply_label_to_devices(devices, to_label, current_organization, conn)
  end

  def add_devices_to_label(conn, %{"devices" => devices, "new_label" => label_name}) do
    # device index dropdown - add label to selected devices
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
    # individual label show dropdown - remove selected devices from label
    current_organization = conn.assigns.current_organization
    with {_, nil} <- Labels.delete_devices_from_label(devices, label_id, current_organization) do
      label = Labels.get_label!(label_id)
      ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{label.id}:update_label_devices", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
      Enum.each(devices, fn device ->
        ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
      end)
      broadcast_router_update_devices(devices)

      conn
      |> put_resp_header("message", "Device(s) successfully removed from label")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"labels" => labels, "device_id" => device_id}) do
    # device index table - remove label from device entry in table row
    current_organization = conn.assigns.current_organization
    with {_, nil} <- Labels.delete_labels_from_device(labels, device_id, current_organization) do
      device = Devices.get_device!(device_id)
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device.id}:device_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_update", "graphql:flows_update:#{current_organization.id}:organization_flows_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device_id}:device_update", %{})
      Enum.each(labels, fn label ->
        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{label}:update_label_devices", %{})
      end)
      broadcast_router_update_devices([device_id])

      conn
      |> put_resp_header("message", "Label(s) successfully removed from device")
      |> send_resp(:no_content, "")
    else { :error } ->
      conn
      |> send_resp(400, "")
    end
  end

  def delete_devices_from_labels(conn, %{"devices" => devices}) do
    # device index dropdown - remove all labels from selected devices
    current_organization = conn.assigns.current_organization
    with {:ok, _} <- Labels.delete_all_labels_from_devices(devices, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
      Enum.each(devices, fn device ->
        ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
      end)
      broadcast_router_update_devices(devices)

      conn
      |> put_resp_header("message", "All labels successfully removed from devices")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"labels" => labels}) do
    current_organization = conn.assigns.current_organization

    with {:ok, labels} <- Labels.delete_all_devices_from_labels(labels, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})

      assoc_labels = labels |> Labels.multi_fetch_assoc([:devices])
      assoc_devices = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.map(fn d -> d.id end) |> Enum.uniq()
      Enum.each(assoc_devices, fn device ->
        ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
      end)
      broadcast_router_update_devices(assoc_devices)

      conn
      |> put_resp_header("message", "All devices successfully removed from labels")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, _params) do
    current_organization = conn.assigns.current_organization

    Labels.delete_all_labels_from_devices_for_org(current_organization)
    all_device_ids = Devices.get_devices(current_organization.id) |> Enum.map(fn d -> d.id end)

    ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
    ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
    Enum.each(all_device_ids, fn device ->
      ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
    end)
    broadcast_router_update_devices(all_device_ids)

    conn
      |> put_resp_header("message", "All devices successfully removed from labels")
      |> send_resp(:no_content, "")
  end

  defp create_label_and_apply_to_devices(devices, label_name, organization, user, conn) do
    current_organization = conn.assigns.current_organization
    cond do
      length(devices) == 0 -> {:error, :bad_request, "Please select a device"}
      Labels.get_label_by_name(label_name, organization.id) != nil -> {:error, :bad_request, "That label already exists"}
      true ->
        label_changeset =
          %Label{}
          |> Label.changeset(%{"name" => label_name, "organization_id" => organization.id, "creator" => user.email})

        result =
          Ecto.Multi.new()
          |> Ecto.Multi.insert(:label, label_changeset)
          |> Ecto.Multi.run(:devices_labels, fn _repo, %{label: label} ->
            Labels.add_devices_to_label(devices, label.id, organization)
          end)
          |> Repo.transaction()

        with {:ok, %{devices_labels: _, label: _label }} <- result do
          ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
          device = Devices.get_device!(List.first(devices))
          ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device.id}:device_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})
          Enum.each(devices, fn device ->
            ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
            ConsoleWeb.Endpoint.broadcast("graphql:mobile_device_labels", "graphql:mobile_device_labels:#{device}:labels_update", %{})
          end)

          broadcast_router_update_devices(devices)

          conn
          |> put_resp_header("message", "Devices added to label successfully")
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
      with {:ok, devices_labels} <- Labels.add_devices_to_label(devices, destination_label.id, organization) do
        device = Devices.get_device!(List.first(devices))

        ConsoleWeb.Endpoint.broadcast("graphql:label_show_table", "graphql:label_show_table:#{destination_label.id}:update_label_devices", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{current_organization.id}:device_list_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device.id}:device_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:devices_in_labels_update", "graphql:devices_in_labels_update:#{current_organization.id}:organization_devices_in_labels_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:flows_update", "graphql:flows_update:#{current_organization.id}:organization_flows_update", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:flows_nodes_menu", "graphql:flows_nodes_menu:#{current_organization.id}:all_resources_update", %{})

        assoc_devices = devices_labels |> Enum.map(fn dl -> dl.device_id end)
        Enum.each(assoc_devices, fn device ->
          ConsoleWeb.Endpoint.broadcast("graphql:device_show_labels_table", "graphql:device_show_labels_table:#{device}:device_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:mobile_device_labels", "graphql:mobile_device_labels:#{device}:labels_update", %{})
        end)
        broadcast_router_update_devices(assoc_devices)

        conn
        |> put_resp_header("message", "Devices added to label successfully")
        |> send_resp(:no_content, "")
      end
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
