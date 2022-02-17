defmodule ConsoleWeb.V1.FlowController do
  use ConsoleWeb, :controller
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Console.Flows
  alias Console.Organizations
  alias Console.Devices
  alias Console.Functions
  alias Console.Labels
  alias Console.Channels
  alias Console.Channels.Channel
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, %{ "integration_id" => id }) do
    current_organization = conn.assigns.current_organization

    flows = Flows.get_flows_with_channel_id(current_organization.id, id)

    render(conn, "index.json", flows: flows)
  end

  def index(conn, _) do
    current_organization = conn.assigns.current_organization

    flows = Flows.get_flows(current_organization.id)

    render(conn, "index.json", flows: flows)
  end

  def create(conn, params = %{ "integration_id" => id }) do
    current_organization = conn.assigns.current_organization

    case Channels.get_channel(current_organization, id) do
      nil ->
        {:error, :not_found, "Integration not found"}
      %Channel{} = channel ->
        cond do
          Map.has_key?(params, "device_id") and Map.has_key?(params, "label_id") ->
            {:error, :bad_request, "Flow must not contain both device_id and label_id"}
          Map.has_key?(params, "device_id") ->
            device = Devices.get_device!(current_organization, Map.get(params, "device_id"))
            function =
              if Map.has_key?(params, "function_id") do
                Functions.get_function!(current_organization, Map.get(params, "function_id"))
              else
                %{ id: nil }
              end

            flow_attrs = %{
              device_id: device.id,
              channel_id: channel.id,
              function_id: function.id,
              organization_id: current_organization.id
            }

            with {:ok, _} <- Flows.create_flow(flow_attrs) do
              broadcast_router_update_devices([device.id])

              conn
              |> send_resp(:ok, "Flow with integration created successfully")
            end
          Map.has_key?(params, "label_id") ->
            label = Labels.get_label!(current_organization, Map.get(params, "label_id"))
            function =
              if Map.has_key?(params, "function_id") do
                Functions.get_function!(current_organization, Map.get(params, "function_id"))
              else
                %{ id: nil }
              end

            flow_attrs = %{
              label_id: label.id,
              channel_id: channel.id,
              function_id: function.id,
              organization_id: current_organization.id
            }

            with {:ok, _} <- Flows.create_flow(flow_attrs) do
              device_ids =
                Devices.get_devices_for_label(label.id)
                |> Enum.map(fn d -> d.id end)

              broadcast_router_update_devices(device_ids)

              conn
              |> send_resp(:ok, "Flow with integration created successfully")
            end
          true ->
            {:error, :bad_request, "Flow must contain either device_id or label_id"}
        end
    end
  end

  def delete(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization
    case Flows.get_flow(current_organization.id, id) do
      nil ->
        {:error, :not_found, "Flow not found"}
      flow ->
        result =
          Ecto.Multi.new()
          |> Ecto.Multi.run(:deleted_flow, fn _repo, _ ->
            Flows.delete_flow(flow)
          end)
          |> Ecto.Multi.run(:updated_org, fn _repo, _ ->
            if flow.function_id == nil do
              updated_edges =
                Enum.reject(current_organization.flow["edges"], fn edge ->
                  edge["source"] == "device-#{flow.device_id}" and edge["target"] == "channel-#{flow.channel_id}" or
                  edge["source"] == "label-#{flow.label_id}" and edge["target"] == "channel-#{flow.channel_id}"
                end)
              updated_flow = Map.put(current_organization.flow, "edges", updated_edges)
              Organizations.update_organization(current_organization, %{ flow: updated_flow })
            else
              updated_edges = get_updated_edges(current_organization, flow)
              updated_flow = Map.put(current_organization.flow, "edges", updated_edges)
              Organizations.update_organization(current_organization, %{ flow: updated_flow })
            end
          end)
          |> Repo.transaction

      with {:ok, _} <- result do
        if Map.get(flow, :device_id) != nil do
          broadcast_router_update_devices([flow.device_id])
        end
        if Map.get(flow, :label_id) != nil do
          device_ids =
            Devices.get_devices_for_label(flow.label_id)
            |> Enum.map(fn d -> d.id end)

          broadcast_router_update_devices(device_ids)
        end

        conn
        |> send_resp(:ok, "Flow deleted successfully")
      end
    end
  end

  defp get_updated_edges(current_organization, flow) do
    all_function_keys_and_copies =
      current_organization.flow
      |> Map.keys()
      |> Enum.filter(fn key -> String.contains?(key, flow.function_id) end)

    edge_source =
      case flow.device_id do
        nil -> "label-#{flow.label_id}"
        _ -> "device-#{flow.device_id}"
      end

    function_keys_to_check =
      all_function_keys_and_copies
      |> Enum.filter(fn key ->
        Enum.find(current_organization.flow["edges"], fn edge ->
          edge["source"] == edge_source and edge["target"] == key
        end) != nil and
        Enum.find(current_organization.flow["edges"], fn edge ->
          edge["source"] == key and edge["target"] == "channel-#{flow.channel_id}"
        end) != nil
      end)

    Enum.reject(current_organization.flow["edges"], fn edge ->
      edge["source"] == edge_source and edge["target"] in function_keys_to_check
    end)
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
