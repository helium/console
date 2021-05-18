defmodule Console.Repo.Migrations.PopulateOrgWebhookKey do
  use Ecto.Migration
  alias Console.Helpers
  import Ecto.Query, only: [from: 2]
  alias Console.Organizations.Organization

  def up do
    # organizations = from(o in Organization, where: is_nil(o.webhook_key)) |> Console.Repo.all
    
    # Enum.each(organizations, fn organization ->
    #   webhook_key = Helpers.generate_token(32)
    
    #   organization
    #   |> Organization.changeset(%{ webhook_key: webhook_key })
    #   |> Console.Repo.update()
    # end)
  end

  def down do
    # organizations = from(o in Organization, where: not is_nil(o.webhook_key)) |> Console.Repo.all
    
    # Enum.each(organizations, fn organization ->
    #   changeset = Ecto.Changeset.change(organization, webhook_key: nil)
    #   Console.Repo.update!(changeset)
    # end)
  end
end
