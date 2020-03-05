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

      %ApiKey{ organization_id: id } ->
        current_organization = Organizations.get_organization!(id)
        conn
        |> assign(:current_organization, current_organization)
    end
  end
end
