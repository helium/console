defmodule ConsoleWeb.Mailerlite do
  def subscribe(email) do
    case Application.get_env(:console, :mailerlite_api_key) do
      nil -> nil
      api_key ->
        headers = [{"Content-Type", "application/json"}, {"X-MailerLite-ApiKey", api_key}]
        body = Jason.encode!(%{ email: email })
        HTTPoison.post "https://api.mailerlite.com/api/v2/groups/89103602/subscribers", body, headers
    end

  end
end
