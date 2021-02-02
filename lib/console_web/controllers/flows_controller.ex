defmodule ConsoleWeb.FlowsController do
  use ConsoleWeb, :controller
  import Ecto.Query

  alias Console.Repo
  alias Console.Functions
  alias Console.Functions.Function
  alias Console.Labels
  alias Console.Labels.Label
  alias Console.Channels
  alias Console.Channels.Channel

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def update_edges(conn, %{"removeEdges" => remove_edges, "addEdges" => add_edges}) do
    current_organization = conn.assigns.current_organization

    functions_to_remove = Enum.filter(remove_edges, fn edge -> Map.get(edge, "type") == "function" end)
    channels_to_remove = Enum.filter(remove_edges, fn edge -> Map.get(edge, "type") == "channel" end)
    functions_to_add = Enum.filter(add_edges, fn edge -> Map.get(edge, "type") == "function" end)
    channels_to_add = Enum.filter(add_edges, fn edge -> Map.get(edge, "type") == "channel" end)

    result =
    Ecto.Multi.new()
    |> Ecto.Multi.run(:removed_functions, fn _repo, _ ->
      label_ids = Enum.map(functions_to_remove, fn edge -> Map.get(edge, "source") end)

      {count, _} =
        from(l in Label,
          where: l.organization_id == ^current_organization.id and l.id in ^label_ids,
          select: l.id,
        )
        |> Repo.update_all(set: [function_id: nil])

      if count == Enum.count(functions_to_remove) do
        {:ok, "success"}
      else
        {:error, "failed to remove functions from labels"}
      end
    end)
    |> Ecto.Multi.run(:removed_channels, fn _repo, _ ->
      count =
        Enum.map(channels_to_remove, fn edge ->
          {1, _} = Labels.delete_labels_from_channel([Map.get(edge, "source")], Map.get(edge, "target"), current_organization)
          1
        end)
        |> Enum.sum()

      if count == Enum.count(channels_to_remove) do
        {:ok, "success"}
      else
        {:error, "failed to remove integrations from labels"}
      end
    end)
    |> Ecto.Multi.run(:added_functions, fn _repo, _ ->
      count =
        Enum.map(functions_to_add, fn edge ->
          function = Functions.get_function!(current_organization, Map.get(edge, "target"))

          {:ok, _} = Labels.add_function_to_labels(function, [Map.get(edge, "source")], current_organization)
          1
        end)
        |> Enum.sum()

      if count == Enum.count(functions_to_add) do
        {:ok, "success"}
      else
        {:error, "failed to add functions to labels"}
      end
    end)
    |> Ecto.Multi.run(:added_channels, fn _repo, _ ->
      count =
        Enum.map(channels_to_add, fn edge ->
          channel = Channels.get_channel!(current_organization, Map.get(edge, "target"))

          {:ok, 1, _} = Labels.add_labels_to_channel([Map.get(edge, "source")], channel, current_organization)
          1
        end)
        |> Enum.sum()

      if count == Enum.count(channels_to_add) do
        {:ok, "success"}
      else
        {:error, "failed to add integrations to labels"}
      end
    end)
    |> Repo.transaction()

    with {:ok, _} <- result do
      conn
      |> put_resp_header("message", "Updated all edges successfully")
      |> send_resp(:ok, "")
    end
  end
end
