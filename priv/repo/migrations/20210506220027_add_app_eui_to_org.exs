defmodule Console.Repo.Migrations.AddAppEuiToOrg do
  use Ecto.Migration
  alias Console.Helpers
  import Ecto.Query, only: [from: 2]
  alias Console.Organizations.Organization

  def up do
    alter table(:organizations) do
      add :default_app_eui, :string
    end

    flush()

    # organizations = from(o in Organization, where: is_nil(o.default_app_eui)) |> Console.Repo.all
    # Enum.each(organizations, fn organization ->
    #   app_eui = "6081F9" <> Helpers.generate_string(10, '0123456789ABCDEF')

    #   organization
    #   |> Organization.update_changeset(%{ default_app_eui: app_eui })
    #   |> Console.Repo.update()
    # end)

    # flush()

    alter table(:organizations) do
      modify :default_app_eui, :string, null: false
    end
  end

  def down do
    alter table(:organizations) do
      remove :default_app_eui
    end
  end
end
