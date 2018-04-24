defmodule Console.Groups.ChannelsGroups do
  use Ecto.Schema

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels_groups" do
    belongs_to :channel, Console.Channels.Channel
    belongs_to :group, Console.Groups.Group

    timestamps()
  end
end
