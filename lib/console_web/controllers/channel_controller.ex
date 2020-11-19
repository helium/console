defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

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

  def create(conn, %{"channel" => channel_params, "func" => func}) do
    current_organization = conn.assigns.current_organization
    user = conn.assigns.current_user
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    # result =
    #   Ecto.Multi.new()
    #   |> Ecto.Multi.run(:new_channel, fn _repo, _ ->
    #     with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
    #       {:ok, channel}
    #     end
    #   end)
    #   |> Ecto.Multi.run(:new_label, fn _repo, %{new_channel: new_channel} ->
    #     new_labels = [%{ "name" => channel_params["name"] }]
    #     Labels.create_labels_add_channel(new_channel, new_labels, current_organization, user)
    #   end)
    #   |> Ecto.Multi.run(:new_function, fn _repo, _ ->
    #     Functions.create_function(function_params, current_organization)
    #   end)
    #   |> Ecto.Multi.run(:hi, fn _repo, _ ->
    #     Labels.add_function_to_labels(new_function, [label], organization)
    #   end)

    # IO.inspect result

    # broadcast(channel)
    # broadcast_router_update_devices(channel)

    # conn
    # |> put_status(:created)
    # |> render("show.json", channel: channel)
    # result = 
    #   Ecto.Multi.new()
    #   |> Ecto.Multi.run
        # with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
        #   new_labels = [%{ "name" => channel_params["name"] }]
        #   Labels.create_labels_add_channel(channel, new_labels, current_organization, user)

        #   broadcast(channel)
        #   broadcast_router_update_devices(channel)

        #   conn
        #   |> put_status(:created)
        #   |> render("show.json", channel: channel)
        # end
      # |> Ecto.Multi.run
    # create channel
    # create function or attach function
    # create & add same label to all w/ name of channel 
    # Labels.create_labels_add_channel
    # Labels.add_function_to_labels

    # with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
    #   case func["function_id"]:
    #   case func["cayenne"]:
      # case labels["labelsApplied"] do
      #   nil -> nil
      #   applied_labels ->
      #     label_ids = applied_labels
      #       |> Enum.map(fn label ->
      #         label["id"]
      #       end)
      #     Labels.add_labels_to_channel(label_ids, channel, current_organization)
      # end

      # case labels["newLabels"] do
      #   nil -> nil
      #   new_labels ->
      #     Labels.create_labels_add_channel(channel, new_labels, current_organization, user)
      # end
    # end
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
