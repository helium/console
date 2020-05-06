defmodule Console.Repo.Migrations.ChangeFunctionFieldBodyType do
  use Ecto.Migration

  def change do
    alter table(:functions) do
      modify :body, :text
    end
  end
end
