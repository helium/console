defmodule ConsoleWeb.ApiKeyController do
  use ConsoleWeb, :controller
  alias Console.ApiKeys
  alias Console.Email
  alias Console.Mailer
  alias Console.ApiKeys.ApiKey

  plug ConsoleWeb.Plug.AuthorizeAction when action not in [:accept]

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"api_key" => params}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    keys = ApiKeys.get_user_api_keys(current_user)

    if length(keys) > 9 do
      {:error, :forbidden, "Users can create a maximum of 10 api keys each"}
    else
      key = :crypto.strong_rand_bytes(32) |> Base.encode64(padding: false)
      params = Map.put(params, "key", :crypto.hash(:sha256, key))
      params = Map.update(params, "name", nil, fn name -> String.trim(name) end)

      with {:ok, %ApiKey{} = api_key} <- ApiKeys.create_api_key(current_organization, current_user, params) do
        ConsoleWeb.Endpoint.broadcast("graphql:api_keys", "graphql:api_keys:#{conn.assigns.current_organization.id}:api_key_list_update", %{})
        Email.api_key_email(current_user, api_key) |> Mailer.deliver_later()

        conn
        |> put_status(:created)
        |> put_resp_header("message",  "API Key #{api_key.name} added successfully")
        |> render("show.json", api_key: api_key, key: key)
      end
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    api_key = ApiKeys.get_api_key!(current_organization, id)

    with {:ok, %ApiKey{} = api_key} <- ApiKeys.delete_api_key(api_key) do
      ConsoleWeb.Endpoint.broadcast("graphql:api_keys", "graphql:api_keys:#{conn.assigns.current_organization.id}:api_key_list_update", %{})

      conn
      |> put_resp_header("message", "#{api_key.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def accept(conn, %{"token" => token}) do
    with %ApiKey{} = api_key <- ApiKeys.get_api_key_by_token_and_lock(token) do
      case ApiKeys.mark_api_key_activated(api_key) do
        {:ok, _} ->
          conn
          |> put_flash(:info, "Your API key is now activated")
          |> redirect(to: "/profile")
          |> halt()
        _ ->
          conn
          |> put_flash(:error, "Something went wrong")
          |> redirect(to: "/profile")
          |> halt()
      end
    else
      nil ->
        conn
        |> put_flash(:error, "Invalid API Key token provided")
        |> redirect(to: "/profile")
        |> halt()
    end
  end
end
