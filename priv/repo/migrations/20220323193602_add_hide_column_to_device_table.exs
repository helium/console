defmodule Console.Repo.Migrations.AddHideColumnToDeviceTable do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :hide_from_xor, :boolean, default: false, null: false
    end
  end
end
