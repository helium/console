defmodule Console.Repo.Migrations.AddMultiBuyIdToDeviceAndLabel do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      add :multi_buy_id, references(:multi_buys)
    end

    alter table(:devices) do
      add :multi_buy_id, references(:multi_buys)
    end
  end
end
