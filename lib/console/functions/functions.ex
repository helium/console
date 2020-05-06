defmodule Console.Functions do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Functions.Function
  alias Console.Organizations.Organization
  alias Console.Labels

  def get_function!(organization, id) do
     Repo.get_by!(Function, [id: id, organization_id: organization.id])
  end

  def get_organization_function_count(organization) do
    functions = from(f in Function, where: f.organization_id == ^organization.id) |> Repo.all()
    length(functions)
  end

  def fetch_assoc(%Function{} = function, assoc \\ [:labels]) do
    Repo.preload(function, assoc)
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

  def update_function(%Function{} = function, attrs) do
    function
    |> Function.changeset(attrs)
    |> Repo.update()
  end

  def delete_function(%Function{} = function) do
    labels = fetch_assoc(function).labels
    Repo.transaction(fn ->
      Enum.each(labels, fn label ->
        Labels.update_label(label, %{ "function_id" => nil })
      end)
      Repo.delete(function)
    end)
  end
end
