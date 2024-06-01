defmodule Console.CommunityChannels do
  def append_connection_details(channel) do
    case channel.type do
      "blockbax" ->
        channel
        |> Map.put(:endpoint, "#{channel.credentials["blockbaxInboundConnectorEndpoint"]}")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Content-Type" => "application/json" }))
        |> Map.put(:headers, Jason.encode!(%{ "Authorization" => "ApiKey #{channel.credentials["blockbaxAccessToken"]}" }))
      "cargo" ->
        channel
        |> Map.put(:endpoint, "https://cargo.helium.com/api/payloads")
        |> Map.put(:method, "post")
        |> Map.put(:headers, Jason.encode!(%{ "Content-Type" => "application/json" }))
      "adafruit" ->
        channel
        |> Map.put(:credentials, %{
          endpoint: "mqtts://#{channel.credentials["username"]}:#{channel.credentials["adafruit_key"]}@io.adafruit.com:8883",
          uplink: %{
            topic: "#{channel.credentials["username"]}/groups/#{channel.credentials["group_name"]}/json"
          },
          downlink: %{
            topic: nil
          },
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

  def inject_credentials(channel, show_underlying_type \\ true) do
    case channel.type do
      "blockbax" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "#{channel.credentials["inboundConnectorEndpoint"]}",
          "headers" => %{ "Authorization" => "ApiKey #{channel.credentials["accessToken"]}" },
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "cargo" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://cargo.helium.com/api/payloads",
          "headers" => %{ "Content-Type" => "application/json" },
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "adafruit" ->
        channel
        |> Map.put(:credentials, %{
          endpoint: "mqtts://#{channel.credentials["username"]}:#{channel.credentials["adafruit_key"]}@io.adafruit.com:8883",
          uplink: %{
            topic: "#{channel.credentials["username"]}/groups/#{channel.credentials["group_name"]}/json"
          },
        })
        |> Map.put(:type, (if show_underlying_type, do: "mqtt", else: channel.type))
      "akenza" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://data-gateway.akenza.io/v3/capture?secret=#{channel.credentials["secret"]}",
          "headers" => %{},
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "datacake" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://api.datacake.co/integrations/lorawan/helium/",
          "headers" => %{ "Key" => "Authentication", "Value" => "Token #{channel.credentials["token"]}" },
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "google_sheets" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://docs.google.com/forms/d/e/#{channel.credentials["form_id"]}/formResponse",
          "headers" => %{ "Content-Type" => "application/x-www-form-urlencoded" },
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "microshare" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://ingest.paks.microshare.io/share/io.microshare.helium.packed/token/#{channel.credentials["token"]}",
          "headers" => %{ "Authorization" => "Bearer #{channel.credentials["token"]}" },
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "my_devices" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://lora.mydevices.com/v1/networks/helium/uplink",
          "headers" => %{},
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "tago" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://helium.middleware.tago.io/uplink",
          "headers" => %{ "Authorization" => channel.credentials["token"] },
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      "ubidots" ->
        channel
        |> Map.put(:credentials, %{
          "endpoint" => "https://dataplugin.ubidots.com/api/web-hook/#{channel.credentials["webhook_token"]}",
          "headers" => %{},
          "method" => "post",
          "url_params" => %{}
        })
        |> Map.put(:type, (if show_underlying_type, do: "http", else: channel.type))
      _ ->
        channel
    end
  end
end
