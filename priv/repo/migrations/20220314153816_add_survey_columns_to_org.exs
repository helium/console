defmodule Console.Repo.Migrations.AddSurveyColumnsToOrg do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :survey_token, :string
      add :survey_token_sent_at, :naive_datetime
      add :survey_token_inserted_at, :naive_datetime
      add :survey_token_used, :boolean
    end

    create index(:organizations, [:survey_token_used])
  end
end
