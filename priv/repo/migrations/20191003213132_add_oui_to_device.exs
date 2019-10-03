defmodule Console.Repo.Migrations.AddOuiToDevice do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :oui, :integer
    end
  end
end
