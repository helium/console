defmodule Console.Labels.LabelResolver do
  alias Console.Repo
  alias Console.Labels.Label
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    labels = Label
      |> where([l], l.organization_id == ^current_organization.id)
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, labels}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    label = Ecto.assoc(current_organization, :labels) |> Repo.get!(id)

    {:ok, label}
  end
end
