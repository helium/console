defmodule Console.HotspotStats.HotspotStat do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device
  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "hotspot_stats" do
    field :router_uuid, :string
    field :hotspot_address, :string
    field :rssi, :float
    field :snr, :float
    field :channel, :integer
    field :spreading, :string
    field :category, :string
    field :sub_category, :string
    field :reported_at_epoch, :integer

    belongs_to :device, Device
    belongs_to :organization, Organization
    timestamps()
  end

  def changeset(device_stat, attrs) do
    device_stat
    |> cast(attrs, [
      :router_uuid,
      :hotspot_address,
      :rssi,
      :snr,
      :channel,
      :spreading,
      :category,
      :sub_category,
      :reported_at_epoch,
      :device_id,
      :organization_id
    ])
  end
end
