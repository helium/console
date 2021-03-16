defmodule ConsoleWeb.FlowsController do
  use ConsoleWeb, :controller
  import Ecto.Query

  alias Console.Repo
  alias Console.Functions
  alias Console.Labels
  alias Console.Labels.Label
  alias Console.Channels

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def update_edges(conn, %{"removeEdges" => remove_edges, "addEdges" => add_edges}) do
    current_organization = conn.assigns.current_organization

    # result =
    #   Ecto.Multi.new()
    #   |> Ecto.Multi.run(:added_devices_functions, fn _repo, _ ->
    #     edges =
    #       Enum.filter(add_edges, fn edge ->
    #         edge["source"] |> String.first() == "d" and edge["target"] |> String.first() == "f"
    #       end)
    #       |> Enum.map(fn edge ->
    #         %{
    #           device_id: edge["source"] |> String.trim_leading("device-"),
    #           function_id: edge["target"] |> String.trim_leading("function-"),
    #           organization_id: current_organization.id,
    #         }
    #         |> put_timestamps()
    #       end)
    #
    #     { count, _ }= Repo.insert_all(DeviceFunction, edges)
    #     if count == length(edges) do
    #       {:ok, "success"}
    #     else
    #       {:error, "Failed to connect devices to functions"}
    #     end
    #   end)
    #   |> Ecto.Multi.run(:added_functions_channels, fn _repo, _ ->
    #     edges =
    #       Enum.filter(add_edges, fn edge ->
    #         edge["source"] |> String.first() == "f" and edge["target"] |> String.first() == "c"
    #       end)
    #       |> Enum.map(fn edge ->
    #         %{
    #           function_id: edge["source"] |> String.trim_leading("function-"),
    #           channel_id: edge["target"] |> String.trim_leading("channel-"),
    #           organization_id: current_organization.id,
    #         }
    #         |> put_timestamps()
    #       end)
    #
    #     { count, _ }= Repo.insert_all(FunctionChannel, edges)
    #     if count == length(edges) do
    #       {:ok, "success"}
    #     else
    #       {:error, "Failed to connect functions to integrations"}
    #     end
    #   end)
    #   |> Ecto.Multi.run(:added_devices_channels, fn _repo, _ ->
    #     edges =
    #       Enum.filter(add_edges, fn edge ->
    #         edge["source"] |> String.first() == "d" and edge["target"] |> String.first() == "c"
    #       end)
    #       |> Enum.map(fn edge ->
    #         %{
    #           device_id: edge["source"] |> String.trim_leading("device-"),
    #           channel_id: edge["target"] |> String.trim_leading("channel-"),
    #           organization_id: current_organization.id,
    #         }
    #         |> put_timestamps()
    #       end)
    #
    #     { count, _ }= Repo.insert_all(DeviceChannel, edges)
    #     if count == length(edges) do
    #       {:ok, "success"}
    #     else
    #       {:error, "Failed to connect devices to functions"}
    #     end
    #   end)
    #   |> Repo.transaction()

    # with {:ok, _} <- result do
      conn
      |> put_resp_header("message", "Updated all edges successfully")
      |> send_resp(:ok, "")
    # end
  end

  defp put_timestamps(struct) do
    struct
    |> Map.put(:inserted_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
    |> Map.put(:updated_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
  end
end
