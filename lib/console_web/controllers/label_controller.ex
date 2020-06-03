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
      broadcast(label)

      case label_params["channel_id"] do
        nil -> nil
        id ->
          channel = Ecto.assoc(current_organization, :channels) |> Repo.get!(id)
          Labels.add_labels_to_channel([label.id], channel, current_organization)
      end

      case label_params["function_id"] do
        nil -> nil
        id ->
          function = Functions.get_function!(current_organization, id)
          ConsoleWeb.FunctionController.broadcast(function, function.id)
      end

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Label #{label.name} created successfully")
      |> render("show.json", label: label)
    end
  end

  def update(conn, %{"id" => id, "label" => label_params}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id)
    name = label.name

    function =
      case label_params["function_id"] do
        nil -> false
        id -> Functions.get_function!(current_organization, id)
      end

    with {:ok, %Label{} = label} <- Labels.update_label(label, label_params) do
      broadcast(label, label.id)
      if function, do: ConsoleWeb.FunctionController.broadcast(function, function.id)
      broadcast_router_update_devices(label)

      msg =
        cond do
          function -> "Label #{label.name} added to function successfully"
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
      broadcast(label)
      broadcast_router_update_devices(label.devices)

      conn
      |> put_resp_header("message", "#{label.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"labels" => labels}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(List.first(labels))

    labels_to_delete = Labels.get_labels(current_organization, labels) |> Labels.multi_fetch_assoc([:devices])
    assoc_devices = Enum.map(labels_to_delete, fn l -> l.devices end) |> List.flatten() |> Enum.uniq()

    with {:ok, _} <- Labels.delete_labels(labels, current_organization.id) do
      broadcast(label)
      broadcast_router_update_devices(assoc_devices)

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

        broadcast(destination_label, destination_label.id)

        assoc_devices = devices_labels |> Enum.map(fn dl -> dl.device_id end)
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_devices })

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "to_label" => to_label}) do
    current_organization = conn.assigns.current_organization
    destination_label = Labels.get_label!(current_organization, to_label)

    if length(devices) == 0 do
      {:error, :bad_request, "Please select a device"}
    else
      with {:ok, count, devices_labels} <- Labels.add_devices_to_label(devices, destination_label.id, current_organization) do
        msg =
          case count do
            0 -> "All selected devices are already in label"
            _ -> "#{count} Devices added to label successfully"
          end

        device = Devices.get_device!(List.first(devices))

        broadcast(destination_label, destination_label.id)
        ConsoleWeb.DeviceController.broadcast(device)
        ConsoleWeb.DeviceController.broadcast(device, device.id)

        assoc_devices = devices_labels |> Enum.map(fn dl -> dl.device_id end)
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_devices })

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end

  def add_labels_to_channel(conn, %{"labels" => labels, "channel_id" => channel_id}) do
    current_organization = conn.assigns.current_organization
    channel = Ecto.assoc(current_organization, :channels) |> Repo.get(channel_id)

    with {:ok, count, first_label} <- Labels.add_labels_to_channel(labels, channel, current_organization) do
      msg =
        case count do
          0 -> "All selected labels are already in channel"
          _ ->
            ConsoleWeb.ChannelController.broadcast(channel, channel.id)
            broadcast(first_label)

            labels_updated = Labels.get_labels(current_organization, labels) |> Labels.multi_fetch_assoc([:devices])
            assoc_devices = Enum.map(labels_updated, fn l -> l.devices end) |> List.flatten() |> Enum.uniq()
            broadcast_router_update_devices(assoc_devices)

            "#{count} Labels added to channel successfully"
        end

      conn
      |> put_resp_header("message", msg)
      |> send_resp(:no_content, "")
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "new_label" => label_name}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user

    cond do
      length(devices) == 0 -> {:error, :bad_request, "Please select a device"}
      Labels.get_label_by_name(String.upcase(label_name), current_organization.id) != nil -> {:error, :bad_request, "That label already exists"}
      true ->
        label_changeset =
          %Label{}
          |> Label.changeset(%{"name" => label_name, "organization_id" => current_organization.id, "creator" => current_user.email})

        result =
          Ecto.Multi.new()
          |> Ecto.Multi.insert(:label, label_changeset)
          |> Ecto.Multi.run(:devices_labels, fn _repo, %{label: label} ->
            with {:ok, count, _} <- Labels.add_devices_to_label(devices, label.id, current_organization) do
              {:ok, {label, count}}
            end
          end)
          |> Repo.transaction()

        with {:ok, %{devices_labels: {_, count}, label: label }} <- result do
          broadcast(label)
          device = Devices.get_device!(List.first(devices))
          ConsoleWeb.DeviceController.broadcast(device)
          ConsoleWeb.DeviceController.broadcast(device, device.id)

          broadcast_router_update_devices(label)

          conn
          |> put_resp_header("message", "#{count} Devices added to label successfully")
          |> send_resp(:no_content, "")
        end
    end
  end

  def delete_devices_from_labels(conn, %{"devices" => devices, "label_id" => label_id}) do
    current_organization = conn.assigns.current_organization

    with {_, nil} <- Labels.delete_devices_from_label(devices, label_id, current_organization) do
      label = Labels.get_label!(label_id)
      broadcast(label, label.id)
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => devices })

      conn
      |> put_resp_header("message", "Device(s) successfully removed from label")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"labels" => labels, "device_id" => device_id}) do
    current_organization = conn.assigns.current_organization

    with {_, nil} <- Labels.delete_labels_from_device(labels, device_id, current_organization) do
      device = Devices.get_device!(device_id)
      ConsoleWeb.DeviceController.broadcast(device)
      ConsoleWeb.DeviceController.broadcast(device, device.id)
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => [device.id] })

      conn
      |> put_resp_header("message", "Label(s) successfully removed from device")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"devices" => devices}) do
    current_organization = conn.assigns.current_organization

    with {:ok, devices} <- Labels.delete_all_labels_from_devices(devices, current_organization) do
      devices
        |> List.first()
        |> ConsoleWeb.DeviceController.broadcast()
      broadcast_router_update_devices(devices)

      conn
      |> put_resp_header("message", "All labels successfully removed from devices")
      |> send_resp(:no_content, "")
    end
  end

  def delete_devices_from_labels(conn, %{"labels" => labels}) do
    current_organization = conn.assigns.current_organization

    with {:ok, labels} <- Labels.delete_all_devices_from_labels(labels, current_organization) do
      labels
        |> List.first()
        |> broadcast()

      assoc_labels = labels |> Labels.multi_fetch_assoc([:devices])
      assoc_devices = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq()
      broadcast_router_update_devices(assoc_devices)

      conn
      |> put_resp_header("message", "All devices successfully removed from labels")
      |> send_resp(:no_content, "")
    end
  end

  def delete_labels_from_channel(conn, %{"labels" => labels, "channel_id" => channel_id}) do
    current_organization = conn.assigns.current_organization

    with {_, nil} <- Labels.delete_labels_from_channel(labels, channel_id, current_organization) do
      channel = Channels.get_channel!(channel_id)
      ConsoleWeb.ChannelController.broadcast(channel, channel.id)

      assoc_labels = Labels.get_labels(current_organization, labels) |> Labels.multi_fetch_assoc([:devices])
      assoc_devices = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq()
      broadcast_router_update_devices(assoc_devices)

      conn
      |> put_resp_header("message", "Label(s) successfully removed from channel")
      |> send_resp(:no_content, "")
    end
  end

  def remove_function(conn, %{ "label" => label_id, "function" => function_id }) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, label_id)
    if label.function_id == function_id do
      with {:ok, _} <- Labels.update_label(label, %{ "function_id" => nil }) do
        function = Functions.get_function!(current_organization, function_id)
        ConsoleWeb.FunctionController.broadcast(function)
        ConsoleWeb.FunctionController.broadcast(function, function.id)
        broadcast_router_update_devices(label)

        conn
        |> put_resp_header("message", "Label successfully removed from function")
        |> send_resp(:no_content, "")
      end
    else
      {:error, :not_found, "Function not found on label"}
    end
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

  defp broadcast(%Label{} = label) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_added: "#{label.organization_id}/label_added")
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_added_for_nav: "#{label.organization_id}/label_added_for_nav")
  end

  defp broadcast(%Label{} = label, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_updated: "#{label.organization_id}/#{id}/label_updated")
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
