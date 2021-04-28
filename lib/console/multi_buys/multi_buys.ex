defmodule Console.MultiBuys do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.MultiBuys.MultiBuy

  def get_multi_buy!(id), do: Repo.get!(MultiBuy, id)
  def get_multi_buy(id), do: Repo.get(MultiBuy, id)

  def get_multi_buy!(organization, id) do
    Repo.get_by!(MultiBuy, [id: id, organization_id: organization.id])
 end

  def create_multi_buy(attrs \\ %{}) do
    %MultiBuy{}
    |> MultiBuy.changeset(attrs)
    |> Repo.insert()
  end

  def delete_multi_buy(%MultiBuy{} = multi_buy) do
    Repo.delete(multi_buy)
  end

  def update_multi_buy(%MultiBuy{} = multi_buy, attrs) do
    multi_buy
    |> MultiBuy.changeset(attrs)
    |> Repo.update()
  end
end
