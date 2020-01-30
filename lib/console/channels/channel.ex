defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Events.Event
  alias Console.Channels
  alias Console.Devices.Device
  alias Console.Devices.DevicesChannels

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: true
    field :default, :boolean, default: false
    field :credentials, Cloak.EncryptedMapField
    field :encryption_version, :binary
    field :name, :string
    field :type, :string
    field :type_name, :string
    field :show_dupes, :boolean, default: false

    belongs_to :organization, Organization
    many_to_many :devices, Device, join_through: DevicesChannels, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(channel, attrs \\ %{}) do
    channel
    |> cast(attrs, [:name, :type, :active, :credentials, :organization_id, :default])
    |> validate_required([:name, :type, :active, :credentials, :organization_id, :default])
    |> put_change(:encryption_version, Cloak.version)
    |> check_credentials()
    |> put_type_name()
  end

  def create_changeset(channel, attrs \\ %{}) do
    channel
    |> changeset(attrs)
  end

  def update_changeset(channel, attrs \\ %{}) do
    channel
    |> cast(attrs, [:name, :type, :active, :credentials, :organization_id, :default, :show_dupes])
    |> validate_required([:name, :type, :active, :credentials, :organization_id, :default, :show_dupes])
    |> check_credentials_update(channel.type)
  end

  defp put_type_name(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{type: type}} ->
        type_name =
          case type do
            "aws" -> "AWS IoT"
            "azure" -> "Azure IoT Hub"
            "google" -> "Google Cloud IoT Core"
            "mqtt" -> "MQTT"
            "http" -> "HTTP"
          end

        put_change(changeset, :type_name, type_name)
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
    uri = URI.parse(creds["endpoint"])
    case uri do
      %URI{scheme: scheme} when scheme != "http" and scheme != "https" -> add_error(changeset, :message, "URL scheme is invalid (ex: http/https)")
      %URI{host: nil} -> add_error(changeset, :message, "URL host is invalid (ex: helium.com)")
      uri -> put_change(changeset, :credentials, Map.merge(creds, %{"inbound_token" => generate_token(16)}))
    end
  end

  defp check_mqtt_creds(changeset, creds) do
    uri = URI.parse(creds["endpoint"])
    case uri do
      %URI{scheme: scheme} when scheme != "mqtt" and scheme != "mqtts" -> add_error(changeset, :message, "Endpoint scheme is invalid (ex: mqtt/mqtts)")
      %URI{host: nil} -> add_error(changeset, :message, "Endpoint host is invalid (ex: m1.helium.com)")
      %URI{userinfo: nil} -> add_error(changeset, :message, "Endpoint user info is invalid (ex: username:password)")
      _ ->
        cond do
          String.length(creds["topic"]) == 0 -> add_error(changeset, :message, "Topic should not be blank")
          Regex.match?(~r/ /, creds["topic"]) -> add_error(changeset, :message, "Topic should not have spaces")
          Regex.match?(~r/^\//, creds["topic"]) -> add_error(changeset, :message, "Topic should not start with a forward slash")
          true -> changeset
        end
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end
end
