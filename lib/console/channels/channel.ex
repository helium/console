defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Events.Event

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: false
    field :credentials, Cloak.EncryptedMapField
    field :encryption_version, :binary
    field :name, :string
    field :type, :string

    has_many :events, Event

    timestamps()
  end

  @doc false
  def changeset(channel, attrs) do
    channel
    |> cast(attrs, ~w(name type active credentials))
    |> validate_required([:name, :type, :active, :credentials])
    |> put_change(:encryption_version, Cloak.version)
  end
end
