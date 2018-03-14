defmodule Console.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field :active, :boolean, default: false
    field :credentials, :binary
    field :name, :string
    field :type, :string

    timestamps()
  end

  @doc false
  def changeset(channel, attrs) do
    channel
    |> cast(attrs, [:name, :type, :active, :credentials])
    |> validate_required([:name, :type, :active, :credentials])
  end
end
