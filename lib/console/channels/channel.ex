defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  alias Console.Organizations.Organization
  alias Console.Channels.Channel

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: true
    field :credentials, Console.Encrypted.Map
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :downlink_token, :string
    field :payload_template, :string
    field :time_first_uplink, :naive_datetime
    field :receive_joins, :boolean, default: false
    field :last_errored, :boolean, default: false

    belongs_to :organization, Organization

    timestamps()
  end

  @doc false
  def changeset(channel, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["type", "name"])

    channel
    |> cast(attrs, [:name, :type, :active, :credentials, :organization_id, :payload_template])
    |> validate_required([:name, :type, :active, :credentials, :organization_id])
    |> validate_inclusion(:type, ~w(http mqtt aws azure google iot_central cargo my_devices akenza datacake microshare tago ubidots google_sheets adafruit))
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> check_credentials()
    |> put_type_name()
    |> put_downlink_token()
    |> unique_constraint(:name, name: :channels_name_organization_id_index, message: "This integration name has already been used in this organization")
  end

  def create_changeset(channel, attrs \\ %{}) do
    channel
    |> changeset(attrs)
  end

  def update_changeset(channel, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    channel
    |> cast(attrs, [:name, :credentials, :downlink_token, :payload_template, :time_first_uplink, :receive_joins, :last_errored])
    |> validate_required([:name, :type, :credentials])
    |> validate_length(:name, max: 50)
    |> check_credentials_update(channel.type)
    |> put_downlink_token()
    |> unique_constraint(:name, name: :channels_name_organization_id_index, message: "This name has already been used in this organization")
  end

  defp put_type_name(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: type}} ->
        type_name =
          case type do
            "aws" -> "AWS IoT"
            "azure" -> "Azure IoT Hub"
            "iot_central" -> "Azure IoT Central"
            "google" -> "Google Cloud IoT Core"
            "mqtt" -> "MQTT"
            "http" -> "HTTP"
            "cargo" -> "Cargo"
            "my_devices" -> "myDevices Cayenne"
            "akenza" -> "Akenza"
            "datacake" -> "Datacake"
            "microshare" -> "Microshare"
            "tago" -> "Tago.IO"
            "ubidots" -> "Ubidots"
            "google_sheets" -> "Google Sheets"
            "adafruit" -> "Adafruit IO"
          end

        put_change(changeset, :type_name, type_name)
      _ -> changeset
    end
  end

  def put_downlink_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: "http"}} ->
        token = Helpers.generate_token(32)
        put_change(changeset, :downlink_token, token)
      %Ecto.Changeset{valid?: true, changes: %{downlink_token: "new"}, data: %Channel{type: "http"}} ->
        token = Helpers.generate_token(32)
        put_change(changeset, :downlink_token, token)
      _ -> changeset
    end
  end

  defp check_credentials(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: "http", credentials: creds}} ->
        check_http_creds(changeset, creds)
      %Ecto.Changeset{valid?: true, changes: %{type: "mqtt", credentials: creds}} ->
        check_mqtt_creds(changeset, creds)
      _ -> changeset
    end
  end

  defp check_credentials_update(changeset, type) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{credentials: creds}} ->
        case type do
          "http" -> check_http_creds(changeset, creds)
          "mqtt" -> check_mqtt_creds(changeset, creds)
          _ -> changeset
        end
      _ -> changeset
    end
  end

  defp check_http_creds(changeset, creds) do
    cond do
      creds["method"] in ["post", "get", "put", "patch"] ->
        cond do
          String.contains?(creds["endpoint"], " ") ->
            add_error(changeset, :message, "Endpoint URL cannot have spaces")
          true ->
            uri = URI.parse(creds["endpoint"])
            case uri do
              %URI{scheme: scheme} when scheme != "http" and scheme != "https" -> add_error(changeset, :message, "URL scheme is invalid (ex: http/https)")
              %URI{host: nil} -> add_error(changeset, :message, "URL host is invalid (ex: helium.com)")
              %URI{host: host} ->
                case host |> String.to_charlist() |> :inet.parse_address() do
                  {:ok, {127,_,_,_}} -> add_error(changeset, :message, "Must not provide private or link local addresses")
                  {:ok, {10,_,_,_}} -> add_error(changeset, :message, "Must not provide private or link local addresses")
                  {:ok, {192,168,_,_}} -> add_error(changeset, :message, "Must not provide private or link local addresses")
                  {:ok, {169,254,_,_}} -> add_error(changeset, :message, "Must not provide private or link local addresses")
                  {:ok, {172,byte2,_,_}} ->
                    if Enum.member?(16..31, byte2) do
                      add_error(changeset, :message, "Must not provide private or link local addresses")
                    else
                      put_change(changeset, :credentials, Map.merge(creds, %{"inbound_token" => Helpers.generate_token(16)}))
                    end
                  {:ok, ipv6_addr = {_,_,_,_,_,_,_,_}} ->
                    cond do
                      InetCidr.contains?(InetCidr.parse("::1/128"), ipv6_addr) ->
                        add_error(changeset, :message, "Must not provide private or link local addresses")
                      InetCidr.contains?(InetCidr.parse("fe80::/10"), ipv6_addr) ->
                        add_error(changeset, :message, "Must not provide private or link local addresses")
                      InetCidr.contains?(InetCidr.parse("fc00::/7"), ipv6_addr) ->
                        add_error(changeset, :message, "Must not provide private or link local addresses")
                      true ->
                        put_change(changeset, :credentials, Map.merge(creds, %{"inbound_token" => Helpers.generate_token(16)}))
                    end
                  _ ->
                    put_change(changeset, :credentials, Map.merge(creds, %{"inbound_token" => Helpers.generate_token(16)}))
                end
            end
        end
      true ->
        add_error(changeset, :message, "Method must be get/post/put/patch")
    end
  end

  defp check_mqtt_creds(changeset, creds) do
    uri = URI.parse(creds["endpoint"])
    case uri do
      %URI{scheme: scheme} when scheme != "mqtt" and scheme != "mqtts" -> add_error(changeset, :message, "Endpoint scheme is invalid (ex: mqtt/mqtts)")
      %URI{host: nil} -> add_error(changeset, :message, "Endpoint host is invalid (ex: m1.helium.com)")
      _ ->
        cond do
          Regex.match?(~r/ /, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/ /, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should not have spaces")

          Regex.match?(~r/\/\//, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/\/\//, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should not have consecutive /")

          Regex.match?(~r/^\//, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/^\//, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should not start with a forward slash")

          Regex.match?(~r/\/$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/\/$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should not end with a forward slash")

          Regex.match?(~r/\#.*\#/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/\#.*\#/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should only have 1 # if used")

          Regex.match?(~r/\#.+$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/\#.+$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should end with # if # is used")

          Regex.match?(~r/[^\/]\#$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/[^\/]\#$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should end with # if # is used")

          Regex.match?(~r/[^\/]\#$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/[^\/]\#$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should end with /# if # is used")

          Regex.match?(~r/^\#$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/^\#$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should not just be #")

          Regex.match?(~r/^\+$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/^\+$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should not just be +")

          Regex.match?(~r/[^\/]\+$/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/[^\/]\+$/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should have / in front of + if + is used at the end")

          Regex.match?(~r/[^\/]+\+/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/[^\/]+\+/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should have / in front and after + if + is used in the middle")

          Regex.match?(~r/\+[^\/]+/, creds["uplink"]["topic"]) or
          (creds["downlink"]["topic"] && Regex.match?(~r/\+[^\/]+/, creds["downlink"]["topic"])) -> add_error(changeset, :message, "Topic should have / in front and after + if + is used in the middle")

          true ->
            up_topic_ok = check_topic(creds["uplink"]["topic"])
            down_topic_ok = cond do
              creds["downlink"]["topic"] -> check_topic(creds["downlink"]["topic"])
              true -> true
            end

            if up_topic_ok and down_topic_ok do
              changeset
            else
              add_error(changeset, :message, "Topic must close double curly braces properly, and only use the following 5 variables (device_id, device_eui, device_name, app_eui, organization_id).")
            end
        end
    end
  end

  defp check_topic(topic_string) do
    list = String.split(topic_string, ["{{","}}"])
    if rem(length(list), 2) == 1 do
      variable_names =
        for i <- 0..(length(list) - 1) do
          if rem(i, 2) == 1 do
            Enum.at(list, i)
          else
            nil
          end
        end
      variable_names = Enum.filter(variable_names, fn x -> x != nil end)

      Enum.reduce(variable_names, true, fn x, acc ->
        Enum.member?(["device_id", "device_eui", "app_eui", "organization_id", "device_name"], x) && acc
      end)
    else
      false
    end
  end
end
