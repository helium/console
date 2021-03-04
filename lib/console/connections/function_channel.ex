defmodule Console.Connections.FunctionChannel do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "functions_channels" do
    belongs_to :function, Console.Functions.Function
    belongs_to :channel, Console.Channels.Channel

    timestamps()
  end

  @doc false
  def changeset(function_channel, attrs) do
    function_channel
    |> cast(attrs, [:function_id, :channel_id, :organization_id])
    |> validate_required([:function_id, :channel_id, :organization_id])
    |> unique_constraint(:function_id, name: :functions_channels_function_id_channel_id_index, message: "Function already connected to Channel")
  end
end
