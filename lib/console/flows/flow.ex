defmodule Console.Flows.Flow do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Functions.Function
  alias Console.Channels.Channel
  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "flows" do
    belongs_to :device, Device
    belongs_to :label, Label
    belongs_to :function, Function
    belongs_to :channel, Channel
    belongs_to :organization, Organization
    timestamps()
  end

  @doc false
  def changeset(flow, attrs) do
    flow
    |> cast(attrs, [
      :device_id,
      :organization_id,
      :channel_id,
      :function_id,
      :label_id,
    ])
  end
end
