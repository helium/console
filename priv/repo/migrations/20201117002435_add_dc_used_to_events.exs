defmodule Console.Repo.Migrations.AddDcUsedToEvents do
  use Ecto.Migration

  def change do
    alter table("events") do
      add_if_not_exists :dc_used, :int
    end
  end
end
