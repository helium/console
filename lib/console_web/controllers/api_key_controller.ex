defmodule ConsoleWeb.ApiKeyController do
  use ConsoleWeb, :controller
  alias Console.Repo
  alias Console.ApiKeys
  alias Console.ApiKeys.ApiKey

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"api_key" => params}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    key = :crypto.strong_rand_bytes(32) |> Base.encode64(padding: false)
    params = Map.put(params, "key", :crypto.hash(:sha256, key))

    with {:ok, %ApiKey{} = api_key} <- ApiKeys.create_api_key(current_organization, current_user, params) do
      broadcast(api_key)
      
      conn
      |> put_status(:created)
      |> put_resp_header("message",  "#{api_key.name} created successfully")
      |> render("show.json", api_key: api_key, key: key)
    end
  end

  def delete(conn, %{"id" => id}) do
    api_key = ApiKeys.get_api_key!(id)

    with {:ok, %ApiKey{} = api_key} <- ApiKeys.delete_api_key(api_key) do
      broadcast(api_key)

      conn
      |> put_resp_header("message", "#{api_key.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def broadcast(%ApiKey{} = api_key) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, api_key, api_key_added: "#{api_key.organization_id}/#{api_key.user_id}/api_key_added")
  end
end
