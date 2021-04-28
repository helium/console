defmodule ConsoleWeb.MultiBuyController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.MultiBuys
  alias Console.MultiBuys.MultiBuy

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"multi_buy" => multi_buy_params}) do
    current_organization = conn.assigns.current_organization
    multi_buy_params =
      Map.merge(multi_buy_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %MultiBuy{} = multi_buy} <- MultiBuys.create_multi_buy(multi_buy_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:multi_buys_index_table", "graphql:multi_buys_index_table:#{current_organization.id}:multi_buy_list_update", %{})

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Multi Buy #{multi_buy.name} added successfully")
      |> render("show.json", multi_buy: multi_buy)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    multi_buy = MultiBuys.get_multi_buy!(current_organization, id)

    with {:ok, %MultiBuy{} = multi_buy} <- MultiBuys.delete_multi_buy(multi_buy) do
      ConsoleWeb.Endpoint.broadcast("graphql:multi_buys_index_table", "graphql:multi_buys_index_table:#{current_organization.id}:multi_buy_list_update", %{})

      conn
      |> put_resp_header("message", "#{multi_buy.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end
  #
  def update(conn, %{"id" => id, "multi_buy" => multi_buy_params}) do
    current_organization = conn.assigns.current_organization
    multi_buy = MultiBuys.get_multi_buy!(current_organization, id)
    name = multi_buy.name

    with {:ok, %MultiBuy{} = multi_buy} <- MultiBuys.update_multi_buy(multi_buy, multi_buy_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:multi_buy_show", "graphql:multi_buy_show:#{multi_buy.id}:multi_buy_update", %{})

      msg =
        cond do
          multi_buy.name == name -> "Multiple Packet purchase value updated successfully"
          true -> "Multiple Packet #{name} was successfully updated to #{multi_buy.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", multi_buy: multi_buy)
    end
  end
end
