defmodule ConsoleWeb.FunctionController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Functions
  alias Console.Functions.Function

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"function" => function_params}) do
    current_organization = conn.assigns.current_organization
    function_params = Map.merge(function_params, %{"organization_id" => current_organization.id})

    with {:ok, %Function{} = function} <- Functions.create_function(function_params, current_organization) do
      broadcast(function)
      
      conn
        |> put_status(:created)
        |> put_resp_header("message",  "#{function.name} created successfully")
        |> render("show.json", function: function)
    end
  end

  def broadcast(%Function{} = function) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, function, function_added: "#{function.organization_id}/function_added")
  end
end
