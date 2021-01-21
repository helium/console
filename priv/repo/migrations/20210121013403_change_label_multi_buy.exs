defmodule Console.Repo.Migrations.ChangeLabelMultiBuy do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      modify :multi_buy, :integer, default: 1
    end
  end
end
