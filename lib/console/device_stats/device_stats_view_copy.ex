defmodule Console.DeviceStats.DeviceStatsViewCopy do
  use Ecto.Schema

  @primary_key {:device_id, :binary_id, []}
  schema "device_stats_view_copy" do
    field :packets_30d, :integer
    field :packets_7d, :integer
    field :dc_30d, :integer
    field :dc_7d, :integer
  end
end
