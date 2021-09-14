defmodule ConsoleWeb.FlowsController do
  use ConsoleWeb, :controller
  import Ecto.Query

  alias Console.Repo
  alias Console.Organizations
  alias Console.Flows.Flow
  alias Console.Devices
  alias Console.Labels

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def update_edges(conn, %{"completeFlows" => complete_flows, "elementPositions" => flow_positions}) do
    current_organization = conn.assigns.current_organization

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.run(:flows_changes, fn _repo, _ ->
        existing_flows = from(f in Flow, where: f.organization_id == ^current_organization.id) |> Repo.all()

        new_flows =
          complete_flows
          |> Enum.map(fn flow ->
            Enum.reduce(flow, %{ device_id: nil, label_id: nil, channel_id: nil, function_id: nil }, fn node, acc ->
              case node["type"] do
                "deviceNode" -> Map.put(acc, :device_id, node["id"] |> String.trim_leading("device-"))
                "labelNode" -> Map.put(acc, :label_id, node["id"] |> String.trim_leading("label-"))
                "channelNode" -> Map.put(acc, :channel_id, node["id"] |> String.trim_leading("channel-"))
                "functionNode" -> Map.put(acc, :function_id, node["id"] |> String.trim_leading("function-"))
              end
            end)
            |> Map.put(:organization_id, current_organization.id)
          end)

        flows_to_delete = existing_flows
          |> Enum.filter(fn f ->
            existing_flow = Map.take(f, [:device_id, :label_id, :function_id, :channel_id, :organization_id])

            !Enum.any?(new_flows, fn new_flow ->
              Map.equal?(new_flow, existing_flow)
            end)
          end)

        flows_to_add = new_flows
          |> Enum.filter(fn new_flow ->
            parsed_existing_flows =
              existing_flows
              |> Enum.map(fn f -> Map.take(f, [:device_id, :label_id, :function_id, :channel_id, :organization_id]) end)

            !Enum.any?(parsed_existing_flows, fn existing_flow ->
              Map.equal?(new_flow, existing_flow)
            end)
          end)

        {:ok, %{ flows_to_add: flows_to_add, flows_to_delete: flows_to_delete }}
      end)
      |> Ecto.Multi.run(:deleted_flows, fn _repo, %{ flows_changes: flows_changes } ->
        ids_to_delete =
          flows_changes.flows_to_delete |> Enum.map(fn f -> f.id end)

        { count, nil } = from(f in Flow, where: f.id in ^ids_to_delete) |> Repo.delete_all()
        {:ok, count}
      end)
      |> Ecto.Multi.run(:added_flows, fn _repo, %{ flows_changes: flows_changes } ->
        flows_to_insert =
          flows_changes.flows_to_add |> Enum.map(fn f -> put_timestamps(f) end)

        { count, _ } = Repo.insert_all(Flow, flows_to_insert, on_conflict: :nothing)
        if count == length(flows_changes.flows_to_add) do
          {:ok, "success"}
        else
          {:error, "fail"}
        end
      end)
      |> Ecto.Multi.run(:updated_organization, fn _repo, _ ->
        Organizations.update_organization(current_organization, %{ flow: flow_positions })
      end)
      |> Repo.transaction()

    case result do
      {:ok, %{ flows_changes: flows_changes}} ->
        labels_to_update =
          flows_changes.flows_to_add
          |> Enum.filter(fn x -> x.label_id != nil end)
          |> Enum.map(fn x -> x.label_id end)
          |> Enum.concat(
            flows_changes.flows_to_delete
            |> Enum.filter(fn x -> x.label_id != nil end)
            |> Enum.map(fn x -> x.label_id end)
          )
          |> Enum.uniq()

        devices_to_update =
          flows_changes.flows_to_add
          |> Enum.filter(fn x -> x.device_id != nil end)
          |> Enum.map(fn x -> x.device_id end)
          |> Enum.concat(
            flows_changes.flows_to_delete
            |> Enum.filter(fn x -> x.device_id != nil end)
            |> Enum.map(fn x -> x.device_id end)
          )

        labels = Labels.get_labels_and_attached_devices(labels_to_update)
        all_device_ids =
          labels
          |> Enum.map(fn l -> l.devices end)
          |> List.flatten
          |> Enum.map(fn d -> d.id end)
          |> Enum.concat(devices_to_update)
          |> Enum.uniq()

        ConsoleWeb.Endpoint.broadcast("graphql:flows_update", "graphql:flows_update:#{current_organization.id}:organization_flows_update", %{})
        if length(all_device_ids) > 0 do
          ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => all_device_ids })
        end

        conn
        |> put_resp_header("message", "Flows changes have been successfully saved")
        |> send_resp(:ok, "")
      {:error, :added_flows, "fail", _} ->
        {:error, :bad_request, "Failed to connect all flows. Please make sure you are not duplicating flows with the same nodes."}
      _ -> result
    end
  end

  defp put_timestamps(struct) do
    struct
    |> Map.put(:inserted_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
    |> Map.put(:updated_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
  end
end
