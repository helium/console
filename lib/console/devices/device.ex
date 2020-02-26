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
    field :name, :string
    field :dev_eui, :string
    field :app_key, :string
    field :app_eui, :string
<<<<<<< HEAD
    field :key, :string        
=======
>>>>>>> Store events from devices
    field :oui, :integer

    belongs_to :organization, Organization
    has_many :events, Event
    many_to_many :labels, Label, join_through: DevicesLabels, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(device, attrs) do
    changeset =
      device
      |> cast(attrs, [:name, :dev_eui, :app_eui, :app_key, :organization_id])
      |> put_change(:oui, Application.fetch_env!(:console, :oui))
      |> validate_required([:name, :dev_eui, :app_eui, :app_key, :oui])
      |> unique_constraint(:mac)
  end
end
