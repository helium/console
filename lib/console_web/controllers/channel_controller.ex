defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Channels
  alias Console.Labels
  alias Console.Labels.Label
  alias Console.Channels.Channel
  alias Console.Organizations
  alias Console.Functions
  alias Console.LabelNotificationSettings
  alias Console.LabelNotificationEvents

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"channel" => channel_params, "labels" => labels}) do
    current_organization = conn.assigns.current_organization
    user = conn.assigns.current_user
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
      case labels["labelsApplied"] do
        nil -> nil
        applied_labels ->
          label_ids = applied_labels
            |> Enum.map(fn label ->
              label["id"]
            end)
          Labels.add_labels_to_channel(label_ids, channel, current_organization)
      end

      case labels["newLabels"] do
        nil -> nil
        new_labels ->
          Labels.create_labels_add_channel(channel, new_labels, current_organization, user)
      end
      broadcast(channel)
      broadcast_router_update_devices(channel)

      conn
      |> put_status(:created)
      |> render("show.json", channel: channel)
    end
  end

  def create(conn, %{"channel" => channel_params, "func" => function_params}) do
    current_organization = conn.assigns.current_organization
    user = conn.assigns.current_user
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.run(:channel, fn _repo, _ ->
        with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
          {:ok, channel}
        end
      end)
      |> Ecto.Multi.run(:label, fn _repo, _ ->
        with {:ok, %Label{} = label} <- Labels.create_label(current_organization, %{ "name" => channel_params["name"], "organization_id" => current_organization.id }) do
          {:ok, label}
        end
      end)
      |> Ecto.Multi.run(:label_attached, fn _repo, %{ label: label, channel: channel } ->
        with {:ok, length, label} <- Labels.add_labels_to_channel([label.id], channel, current_organization) do
          {:ok, "label attached success"}
        end
      end)
      |> Ecto.Multi.run(:function, fn _repo, %{ label: label } ->
        cond do
          function_params["format"] === "custom" ->
            Labels.add_function_to_labels(%{ id: function_params["id"] }, [label.id], current_organization)
          function_params["format"] === "cayenne" ->
            function_params = Map.merge(function_params, %{"name" => channel_params["name"], "type" => "decoder", "organization_id" => current_organization.id })
            with {:ok, new_function} <- Functions.create_function(function_params, current_organization) do
              Labels.add_function_to_labels(%{ id: new_function.id }, [label.id], current_organization)
            end
        end
      end)
      |> Repo.transaction()

      case result do
        {:error, _, changeset, _} -> {:error, changeset}
        {:ok, %{ channel: channel, label: label, label_attached: _label_attached, function: function}} ->
          broadcast(channel)
          broadcast_router_update_devices(channel)

          conn
          |> put_status(:created)
          |> render("show.json", channel: channel)
        _ -> result
      end
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    # check if there are devices associated w/ this channel
    devices_labels = Channels.get_channel_devices_per_label(id)
    # get channel info before updating
    updated_channel = case length(devices_labels) do
      0 -> nil
      _ -> %{ channel_id: id, labels: Enum.map(devices_labels, fn l -> l.label_id end), channel_name: channel.name }
    end

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, current_organization, channel_params) do
      broadcast(channel, channel.id)
      broadcast_router_update_devices(channel)

      if updated_channel != nil do
        { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
        details = %{
          channel_name: updated_channel.channel_name,
          updated_by: conn.assigns.current_user.email,
          time: time
        }
        LabelNotificationEvents.notify_label_event(updated_channel.labels, "integration_with_devices_updated", details)
      end

      conn
      |> put_resp_header("message", "Integration #{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id) |> Channels.fetch_assoc([labels: :devices])

    # check if there are devices associated w/ this channel
    devices_labels = Channels.get_channel_devices_per_label(id)
    # get channel info before deleting
    deleted_channel = case length(devices_labels) do
      0 -> nil
      _ -> %{ channel_id: id, labels: Enum.map(devices_labels, fn l -> l.label_id end), channel_name: Channels.get_channel!(id).name }
    end

    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      broadcast(channel)
      broadcast_router_update_devices(channel.labels)

      if (deleted_channel != nil) do
        { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
        details = %{
          channel_name: deleted_channel.channel_name,
          deleted_by: conn.assigns.current_user.email,
          time: time
        }
        LabelNotificationEvents.delete_unsent_label_events_for_integration(deleted_channel.channel_id)
        LabelNotificationEvents.notify_label_event(deleted_channel.labels, "integration_with_devices_deleted", details)
      end

      msg =
        case length(channel.labels) do
          0 -> "The Integration #{channel.name} has been deleted"
          _ ->
            labels = Enum.reduce(channel.labels, "", fn (l, acc) -> acc = acc <> l.name <> ", " end)
            "The devices with label #{labels}are no longer connected to Integration #{channel.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", channel: channel)
    end
  end

  def get_ubidots_url(conn, %{"token" => token, "name" => name}) do
    headers = [{"Content-Type", "application/json"}, {"x-auth-token", token}]
    body = Jason.encode!(%{
      "name": name,
      "description": "Plugin created using Ubidots APIv2",
      "settings": %{
        "device_type_name": "Helium",
        "helium_labels_as": "tags",
        "token": token
      }
    })
    response = HTTPoison.post "https://industrial.api.ubidots.com/api/v2.0/plugin_types/~helium/plugins/", body, headers
    case response do
      {:ok, %{ status_code: 201, body: body }} ->
        conn
        |> put_resp_header("message", "Received Ubidots plugin webhook URL successfully")
        |> send_resp(:ok, body)
      _ ->
        errors = %{ "errors" => %{ "error" => "Failed to create Ubidots plugin with provided token" }}

        conn
        |> send_resp(502, Jason.encode!(errors))
    end
  end

  def broadcast(%Channel{} = channel) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, channel, channel_added: "#{channel.organization_id}/channel_added")
  end

  def broadcast(%Channel{} = channel, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, channel, channel_updated: "#{channel.organization_id}/#{id}/channel_updated")
  end

  defp broadcast_router_update_devices(%Channel{} = channel) do
    assoc_labels = channel |> Channels.fetch_assoc([labels: :devices]) |> Map.get(:labels)
    assoc_device_ids = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end

  defp broadcast_router_update_devices(assoc_labels) do
    assoc_device_ids = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end
end
