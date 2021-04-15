defmodule ConsoleWeb.FlowsController do
  use ConsoleWeb, :controller
  import Ecto.Query

  alias Console.Repo
  alias Console.Organizations
  alias Console.Flows.Flow

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def update_edges(conn, %{"completeFlows" => complete_flows, "elementPositions" => flow_positions}) do
    current_organization = conn.assigns.current_organization

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.run(:deleted_flows, fn _repo, _ ->
        { count, nil } = from(f in Flow, where: f.organization_id == ^current_organization.id) |> Repo.delete_all()

        {:ok, count}
      end)
      |> Ecto.Multi.run(:added_flows, fn _repo, _ ->
        parsed_flows =
          complete_flows
          |> Enum.map(fn flow ->
            Enum.reduce(flow, %{}, fn node, acc ->
              case node["type"] do
                "deviceNode" -> Map.put(acc, :device_id, node["id"] |> String.trim_leading("device-"))
                "labelNode" -> Map.put(acc, :label_id, node["id"] |> String.trim_leading("label-"))
                "channelNode" -> Map.put(acc, :channel_id, node["id"] |> String.trim_leading("channel-"))
                "functionNode" -> Map.put(acc, :function_id, node["id"] |> String.trim_leading("function-"))
              end
            end)
            |> Map.put(:organization_id, current_organization.id)
            |> put_timestamps()
          end)

        { count, _ } = Repo.insert_all(Flow, parsed_flows, on_conflict: :nothing)
        if count == length(parsed_flows) do
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
      {:ok, _} ->
        ConsoleWeb.Endpoint.broadcast("graphql:flows_update", "graphql:flows_update:#{current_organization.id}:organization_flows_update", %{})
        conn
        |> put_resp_header("message", "Updated all edges successfully")
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
