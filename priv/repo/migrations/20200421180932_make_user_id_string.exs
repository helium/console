defmodule Console.Repo.Migrations.MakeUserIdString do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE memberships DROP CONSTRAINT memberships_user_id_fkey"
    execute "ALTER TABLE invitations DROP CONSTRAINT invitations_inviter_id_fkey"
    execute "ALTER TABLE api_keys DROP CONSTRAINT api_keys_user_id_fkey"
    execute "ALTER TABLE twofactors DROP CONSTRAINT twofactors_user_id_fkey"
    execute "ALTER TABLE users ALTER COLUMN id TYPE TEXT"
    execute "ALTER TABLE memberships ALTER COLUMN user_id TYPE TEXT"
    execute "ALTER TABLE invitations ALTER COLUMN inviter_id TYPE TEXT"
    execute "ALTER TABLE api_keys ALTER COLUMN user_id TYPE TEXT"
    execute "ALTER TABLE twofactors ALTER COLUMN user_id TYPE TEXT"
  end

  def down do
    execute "ALTER TABLE memberships ALTER COLUMN user_id TYPE UUID"
    execute "ALTER TABLE invitations ALTER COLUMN inviter_id TYPE UUID"
    execute "ALTER TABLE api_keys ALTER COLUMN user_id TYPE UUID"
    execute "ALTER TABLE twofactors ALTER COLUMN user_id TYPE UUID"
    execute "ALTER TABLE users ALTER COLUMN id TYPE UUID"
    execute """
      ALTER TABLE memberships
      ADD CONSTRAINT memberships_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE
    """
    execute """
      ALTER TABLE invitations
      ADD CONSTRAINT invitations_inviter_id_fkey
      FOREIGN KEY (inviter_id)
      REFERENCES users(id) ON DELETE CASCADE
    """
    execute """
      ALTER TABLE api_keys
      ADD CONSTRAINT api_keys_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE
    """
    execute """
      ALTER TABLE twofactors
      ADD CONSTRAINT twofactors_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE
    """
  end
end
