defmodule Console.Devices.Device do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Events.Event
  alias Console.Channels.Channel
  alias Console.Devices
  alias Console.Labels.DevicesLabels
  alias Console.Labels.Label

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices" do
    field :mac, :string
    field :name, :string
    field :key, :string
    field :seq_id, :integer
    field :oui, :integer
    field :dev_eui, :string

    belongs_to :organization, Organization
    has_many :events, Event, on_delete: :delete_all
    many_to_many :labels, Label, join_through: DevicesLabels, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(device, attrs) do
    changeset =
      device
      |> cast(attrs, [:name, :mac, :key, :organization_id, :seq_id, :dev_eui])
      |> put_change(:oui, Application.fetch_env!(:console, :oui))
      |> validate_required([:name, :mac, :key, :seq_id, :oui, :dev_eui])
      |> unique_constraint(:mac)
  end
end
