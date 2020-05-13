defmodule ConsoleWeb.Auth0Controller do
  use ConsoleWeb, :controller

  action_fallback(ConsoleWeb.FallbackController)

  def get_enrolled_mfa(conn, _params) do
    base_url = Application.get_env(:console, :auth0_baseurl)
    auth0_id = conn.assigns.auth0_id
    case Application.get_env(:console, :auth0_expiration) do
      nil ->
        # Get new Auth0 Management Token
        fetch_new_auth0_token()
      expiration ->
        if expiration <= DateTime.utc_now() do
          fetch_new_auth0_token()
        end
    end

    authorization_header = ["Authorization": "Bearer #{Application.get_env(:console, :auth0_token)}"]
    # Fetch user enrollments from Auth0
    enrollments =
      "#{base_url}/api/v2/users/#{auth0_id}/enrollments"
        |> URI.encode()
        |> HTTPoison.get!(authorization_header)
        |> Map.get(:body)
        |> Poison.decode!()

    # Sum the number of confirmed enrollments and check that the sume is greater than 0
    case Enum.reduce(enrollments, 0, fn enrollment, acc ->
      if enrollment["status"] == "confirmed" do
        1 + acc
      else
        acc
      end
    end) > 0 do
      status ->
        render(conn, "show.json", enrollment_status: status)
    end
  end

  defp fetch_new_auth0_token() do
    base_url = Application.get_env(:console, :auth0_baseurl)
    auth0_client_id = Application.get_env(:console, :auth0_management_id)
    auth0_secret = Application.get_env(:console, :auth0_secret)
    auth0_management_audience = Application.get_env(:console, :auth0_management_aud)
    {:ok, body} = Poison.encode(%{
      client_id: auth0_client_id,
      client_secret: auth0_secret,
      audience: auth0_management_audience,
      grant_type: "client_credentials"
    })
    body =
      "#{base_url}/oauth/token"
        |> HTTPoison.post!(
          body,
          [{"content-type", "application/json"}]
        )
        |> Map.get(:body)
        |> Poison.decode!()
    Application.put_env(:console, :auth0_token, body["access_token"])

    new_expiration =
      DateTime.utc_now()
        |> DateTime.add(body["expires_in"] - 10, :second)
    Application.put_env(:console, :auth0_expiration, new_expiration)
  end

end
