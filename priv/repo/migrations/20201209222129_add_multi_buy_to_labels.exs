defmodule Console.Repo.Migrations.AddMultiBuyToLabels do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      add :multi_buy, :integer, null: false, default: 0
    end
  end
end
