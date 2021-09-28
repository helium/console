defmodule Console.Repo.Migrations.ConfigProfiles do
  use Ecto.Migration

  def change do
    create table(:config_profiles, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :name, :string, null: false
      add :adr_allowed, :boolean, null: false, default: false
      add :cf_list_enabled, :boolean, null: false, default: false
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id, null: false)

      timestamps()
    end

    create unique_index(:config_profiles, [:name, :organization_id])

    alter table(:devices) do
      add :config_profile_id, references(:config_profiles, on_delete: :nilify_all)
    end

    alter table(:labels) do
      add :config_profile_id, references(:config_profiles, on_delete: :nilify_all)
    end
  end
end
