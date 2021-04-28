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
  # def update(conn, %{"id" => id, "alert" => alert_params}) do
  #   current_organization = conn.assigns.current_organization
  #   alert = MultiBuys.get_alert!(current_organization, id)
  #   name = alert.name
  #
  #   with {:ok, %MultiBuy{} = alert} <- MultiBuys.update_alert(alert, alert_params) do
  #     ConsoleWeb.Endpoint.broadcast("graphql:alert_show", "graphql:alert_show:#{alert.id}:alert_update", %{})
  #
  #     msg =
  #       cond do
  #         alert.name == name -> "MultiBuy #{alert.name} updated successfully"
  #         true -> "The alert #{name} was successfully updated to #{alert.name}"
  #       end
  #
  #     conn
  #     |> put_resp_header("message", msg)
  #     |> render("show.json", alert: alert)
  #   end
  # end
end
