defmodule Console.Repo.Migrations.AddEmailColumn do
  use Ecto.Migration
  import Ecto.Query
  alias Console.Repo
  alias Console.Auth.User
  alias Console.Organizations.Membership

  def up do
    alter table(:memberships) do
      add :email, :string
    end
    flush()
    Repo.all(User)
    |> Enum.each(fn(user) ->
         # for each user, find the memberships with their user id and update email
         from(m in Membership, where: m.user_id == ^user.id)
         |> Repo.update_all(set: [email: user.email])
       end)

  end

  def down do
    alter table(:memberships) do
      remove :email
    end
  end
end
