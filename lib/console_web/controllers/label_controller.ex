defmodule ConsoleWeb.LabelController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels
  alias Console.Devices
  alias Console.Channels
  alias Console.Organizations
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"label" => label_params, "channel_id" => channel_id}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    label_params =
      Map.merge(label_params, %{
        "organization_id" => current_organization.id,
        "creator" => current_user.email
      })

    with {:ok, %Label{} = label} <- Labels.create_label(current_organization, label_params) do
      broadcast(label)

      if channel_id != nil do
        channel = Ecto.assoc(current_organization, :channels) |> Repo.get!(channel_id)
        Labels.add_labels_to_channel([label.id], channel, current_organization)
      end

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "#{label.name} created successfully")
      |> render("show.json", label: label)
    end
  end

  def update(conn, %{"id" => id, "label" => label_params}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id)
    name = label.name

    with {:ok, %Label{} = label} <- Labels.update_label(label, label_params) do
      broadcast(label, label.id)
      msg =
        cond do
          label.name == name -> "#{label.name} updated successfully"
          true -> "The label #{name} was successfully updated to #{label.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", label: label)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(current_organization, id)

    with {:ok, %Label{} = label} <- Labels.delete_label(label) do
      broadcast(label)

      conn
      |> put_resp_header("message", "#{label.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"labels" => labels}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(List.first(labels))

    with {:ok, _} <- Labels.delete_labels(labels, current_organization.id) do
      broadcast(label)

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
      with {:ok, count} <- Labels.add_devices_to_label(devices, labels, destination_label.id, current_organization) do
        msg =
          case count do
            0 -> "All selected devices are already in label"
            _ -> "#{count} Devices added to label successfully"
          end

        broadcast(destination_label, destination_label.id)

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
      with {:ok, count} <- Labels.add_devices_to_label(devices, destination_label.id, current_organization) do
        msg =
          case count do
            0 -> "All selected devices are already in label"
            _ -> "#{count} Devices added to label successfully"
          end

        device = Devices.get_device!(List.first(devices))

        broadcast(destination_label, destination_label.id)
        ConsoleWeb.DeviceController.broadcast(device)
        ConsoleWeb.DeviceController.broadcast(device, device.id)

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end

  def add_labels_to_channel(conn, %{"labels" => labels, "channel_id" => channel_id}) do
    current_organization = conn.assigns.current_organization
    channel = Ecto.assoc(current_organization, :channels) |> Repo.get(channel_id)

    with {:ok, count} <- Labels.add_labels_to_channel(labels, channel, current_organization) do
      msg =
        case count do
          0 -> "All selected labels are already in channel"
          _ ->
            ConsoleWeb.ChannelController.broadcast(channel, channel.id)
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
            Labels.add_devices_to_label(devices, label.id, current_organization)
          end)
          |> Repo.transaction()

        with {:ok, %{devices_labels: count, label: label}} <- result do
          broadcast(label)
          device = Devices.get_device!(List.first(devices))
          ConsoleWeb.DeviceController.broadcast(device)
          ConsoleWeb.DeviceController.broadcast(device, device.id)

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

      conn
      |> put_resp_header("message", "All labels successfully removed from devices")
      |> send_resp(:no_content, "")
    end
  end

  def delete_labels_from_channel(conn, %{"labels" => labels, "channel_id" => channel_id}) do
    current_organization = conn.assigns.current_organization

    with {_, nil} <- Labels.delete_labels_from_channel(labels, channel_id, current_organization) do
      channel = Channels.get_channel!(channel_id)
      ConsoleWeb.ChannelController.broadcast(channel, channel.id)

      conn
      |> put_resp_header("message", "Label(s) successfully removed from channel")
      |> send_resp(:no_content, "")
    end
  end

  defp broadcast(%Label{} = label) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_added: "#{label.organization_id}/label_added")
  end

  defp broadcast(%Label{} = label, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_updated: "#{label.organization_id}/#{id}/label_updated")
  end
end
