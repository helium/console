defmodule Console.Auth.Twofactor do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Auth.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "twofactors" do
    field :secret, :string
    field :last_verified, :naive_datetime
    field :last_skipped, :naive_datetime
    belongs_to(:user, User)
  end
end
