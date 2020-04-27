defmodule Console.Repo.Migrations.AddForeignKeyConstraints do
  use Ecto.Migration

  def change do
    execute """
    ALTER TABLE memberships ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
    """
    execute """
    ALTER TABLE invitations ADD CONSTRAINT invitations_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES users (id)
    """
    execute """
    ALTER TABLE api_keys ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
    """
    execute """
    ALTER TABLE twofactors ADD CONSTRAINT twofactors_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id)
    """
  end
end
