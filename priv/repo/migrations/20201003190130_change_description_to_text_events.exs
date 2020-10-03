defmodule Console.Repo.Migrations.ChangeDescriptionToTextEvents do
  use Ecto.Migration

  def change do
    alter table("events") do
      modify :description, :text
    end
  end
end
