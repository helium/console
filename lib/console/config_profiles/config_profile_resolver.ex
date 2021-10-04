defmodule Console.ConfigProfiles.ConfigProfileResolver do
  alias Console.Repo
  alias Console.ConfigProfiles.ConfigProfile
  import Ecto.Query

  def all(_, %{context: %{current_organization: current_organization}}) do
    config_profiles = ConfigProfile
      |> where([a], a.organization_id == ^current_organization.id)
      |> Repo.all()

    {:ok, config_profiles}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    config_profile = ConfigProfile
      |> where([a], a.id == ^id and a.organization_id == ^current_organization.id)
      |> Repo.one!()

    {:ok, config_profile}
  end
end
