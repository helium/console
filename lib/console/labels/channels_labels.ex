defmodule Console.Labels.ChannelsLabels do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels_labels" do
    belongs_to :label, Console.Labels.Label
    belongs_to :channel, Console.Channels.Channel

    timestamps()
  end

  @doc false
  def changeset(channels_label, attrs) do
    channels_label
    |> cast(attrs, [:channel_id, :label_id])
    |> validate_required([:channel_id, :label_id])
    |> unique_constraint(:channel_id, name: :channels_labels_channel_id_label_id_index, message: "Channel already added to Label")
  end

  def join_changeset(channels_label, channel, label) do
    channels_label
    |> changeset(%{channel_id: channel.id, label_id: label.id})
  end
end
