defmodule Console.CommunityChannels do
  def append_connection_details(channel) do
    case channel.type do
      "cargo" ->
        channel
        |> Map.put(:endpoint, "https://cargo.helium.com/api/payloads")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Content-Type" => "application/json" }))
      "adafruit" ->
        channel
        |> Map.put(:credentials, %{
          endpoint: channel.credentials["endpoint"],
          uplink: %{
            topic: channel.credentials["uplink"]["topic"]
          },
          downlink: %{
            topic: channel.credentials["downlink"]["topic"]
          }
        })
        |> Map.put(:endpoint, channel.credentials["endpoint"])
      "akenza" ->
        channel
        |> Map.put(:endpoint, "https://data-gateway.akenza.io/v3/capture?secret=#{channel.credentials["secret"]}")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{}))
      "datacake" ->
        channel
        |> Map.put(:endpoint, "https://api.datacake.co/integrations/lorawan/helium/")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Key" => "Authentication", "Value" => "Token #{channel.credentials["token"]}" }))
      "google_sheets" ->
        channel
        |> Map.put(:endpoint, "https://docs.google.com/forms/d/e/#{channel.credentials["form_id"]}/formResponse")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Content-Type" => "application/x-www-form-urlencoded" }))
      "microshare" ->
        channel
        |> Map.put(:endpoint, "https://ingest.paks.microshare.io/share/io.microshare.helium.packed/token/#{channel.credentials["token"]}")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Authorization" => "Bearer #{channel.credentials["token"]}" }))
      "my_devices" ->
        channel
        |> Map.put(:endpoint, "https://lora.mydevices.com/v1/networks/helium/uplink")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{}))
      "tago" ->
        channel
        |> Map.put(:endpoint, "https://helium.middleware.tago.io/uplink")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Authorization" => channel.credentials["token"] }))
      "ubidots" ->
        channel
        |> Map.put(:endpoint, "https://dataplugin.ubidots.com/api/web-hook/#{channel.credentials["webhook_token"]}")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{}))
      _ ->
        channel
    end
  end
end
