defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  alias Console.Organizations.Organization
  alias Console.Channels
  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Labels.ChannelsLabels

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: true
    field :credentials, Cloak.EncryptedMapField
    field :encryption_version, :binary
    field :name, :string
    field :type, :string
    field :type_name, :string

    belongs_to :organization, Organization
    many_to_many :labels, Label, join_through: ChannelsLabels, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(channel, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["type", "name"])

    channel
    |> cast(attrs, [:name, :type, :active, :credentials, :organization_id])
    |> validate_required([:name, :type, :active, :credentials, :organization_id])
    |> validate_inclusion(:type, ~w(http mqtt aws azure google))
    |> put_change(:encryption_version, Cloak.version)
    |> check_credentials()
    |> put_type_name()
    |> unique_constraint(:name, name: :channels_name_organization_id_index, message: "This name has already been used in this organization")
  end

  def create_changeset(channel, attrs \\ %{}) do
    channel
    |> changeset(attrs)
  end

  def update_changeset(channel, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    channel
    |> cast(attrs, [:name, :active, :credentials, :organization_id])
    |> validate_required([:name, :type, :active, :credentials, :organization_id])
    |> check_credentials_update(channel.type)
    |> unique_constraint(:name, name: :channels_name_organization_id_index, message: "This name has already been used in this organization")
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
      _ ->
        cond do
          Regex.match?(~r/ /, creds["topic"]) -> add_error(changeset, :message, "Topic should not have spaces")
          Regex.match?(~r/^\//, creds["topic"]) -> add_error(changeset, :message, "Topic should not start with a forward slash")
          Regex.match?(~r/\/$/, creds["topic"]) -> add_error(changeset, :message, "Topic should not end with a forward slash")
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
