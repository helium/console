defmodule Console.Functions do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Functions.Function
  alias Console.Organizations.Organization

  def get_function!(organization, id) do
     Repo.get_by!(Function, [id: id, organization_id: organization.id])
  end

  def get_organization_function_count(organization) do
    functions = from(f in Function, where: f.organization_id == ^organization.id) |> Repo.all()
    length(functions)
  end

  def create_function(attrs \\ %{}, %Organization{} = organization) do
    count = get_organization_function_count(organization)
    cond do
      count > 999 ->
        {:error, :forbidden, "Function limit for organization reached"}
      true ->
        %Function{}
        |> Function.changeset(attrs)
        |> Repo.insert()
    end
  end

  def delete_function(%Function{} = function) do
    Repo.delete(function)
  end
end
