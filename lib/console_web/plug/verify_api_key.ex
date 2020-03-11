defmodule ConsoleWeb.Plug.VerifyApiKey do
  import Plug.Conn
  import ConsoleWeb.AuthErrorHandler
  alias Console.ApiKeys
  alias Console.Organizations
  alias Console.ApiKeys.ApiKey

  def init(default), do: default

  def call(conn, _default) do
    key = conn |> get_req_header("key") |> List.first()
    bin = :crypto.hash(:sha256, key)

    case ApiKeys.get_api_key(bin) do
      nil ->
        conn
        |> auth_error({:invalid_api_key, :invalid_api_key}, %{})
        |> halt()
      %ApiKey{ active: false } ->
        conn
        |> auth_error({:api_key_needs_email_verification, :api_key_needs_email_verification}, %{})
        |> halt()
      %ApiKey{ organization_id: organization_id, user_id: user_id } ->
        current_organization = Organizations.get_organization!(organization_id)
        conn
        |> assign(:current_organization, current_organization)
        |> assign(:user_id, user_id)
    end
  end
end
