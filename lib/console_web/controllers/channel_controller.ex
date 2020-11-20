defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Channels
  alias Console.Labels
  alias Console.Channels.Channel
  alias Console.Organizations
  alias Console.Functions

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
      |> Ecto.Multi.run(:label, fn _repo, %{ channel: channel } ->
        new_labels = [%{ "name" => channel_params["name"] }]
        Labels.create_labels_add_channel(channel, new_labels, current_organization, user)
      end)
      |> Ecto.Multi.run(:function, fn _repo, %{ label: label } ->
        {:ok, _, new_label} = label
        cond do
          function_params["format"] === "custom" ->
            Labels.add_function_to_labels(%{ id: function_params["id"] }, [new_label.id], current_organization)
          function_params["format"] === "cayenne" ->
            function_params = Map.merge(function_params, %{"name" => channel_params["name"], "type" => "decoder", "organization_id" => current_organization.id })
            {:ok, new_function} = Functions.create_function(function_params, current_organization)
            Labels.add_function_to_labels(%{ id: new_function.id }, [new_label.id], current_organization)
        end
      end)
      |> Repo.transaction()

    with {:ok, %{ channel: channel, label: label, function: function}} <- result do
      broadcast(channel)
      broadcast_router_update_devices(channel)

      conn
      |> put_status(:created)
      |> render("show.json", channel: channel)
    end
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, current_organization, channel_params) do
      broadcast(channel, channel.id)
      broadcast_router_update_devices(channel)

      conn
      |> put_resp_header("message", "#{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id) |> Channels.fetch_assoc([labels: :devices])

    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      broadcast(channel)
      broadcast_router_update_devices(channel.labels)

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
