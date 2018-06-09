defmodule Console.Notifications.Notification do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "notifications" do
    field :title, :string
    field :body, :string
    field :active, :boolean
    field :url, :string
    field :category, :string
    belongs_to :membership, Console.Teams.Membership

    timestamps()
  end

  @doc false
  def changeset(team, attrs) do
    team
    |> cast(attrs, [:title, :body, :active, :url, :membership_id])
    |> validate_required(:title, message: "Title is required")
  end
end
