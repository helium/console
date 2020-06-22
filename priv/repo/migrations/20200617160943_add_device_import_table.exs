defmodule Console.Repo.Migrations.AddDeviceImportTable do
  use Ecto.Migration

  def up do
    create table(:device_imports, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, :string
      add :organization_id, references("organizations")
      add :type, :string
      add :status, :string
      add :successful_devices, :integer
      timestamps()
    end
  end

  def down do
    drop table("device_imports")
  end
end
