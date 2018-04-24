defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Team
  alias Console.Events.Event

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: false
    field :credentials, Cloak.EncryptedMapField
    field :encryption_version, :binary
    field :name, :string
    field :type, :string
    field :token, :string

    belongs_to :team, Team
    has_many :events, Event, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(channel, attrs \\ %{}) do
    channel
    |> cast(attrs, ~w(name type active credentials team_id))
    |> validate_required([:name, :type, :active, :credentials, :team_id])
    |> put_change(:encryption_version, Cloak.version)
  end

  def create_changeset(channel, attrs \\ %{}) do
    channel
    |> changeset(attrs)
    |> put_token()
  end

  defp put_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :token, generate_token(16))
      _ -> changeset
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end
end
