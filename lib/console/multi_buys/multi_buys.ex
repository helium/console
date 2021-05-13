defmodule Console.MultiBuys do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.MultiBuys.MultiBuy
  alias Console.Devices.Device
  alias Console.Labels.Label

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

  def get_all_multi_buy_associated_device_ids(id) do
    device_ids =
      get_associated_multi_buy_devices(id)
      |> Enum.map(fn d -> d.id end)

    label_device_ids =
      get_associated_multi_buy_labels(id)
      |> Enum.map(fn l -> l.devices end)
      |> List.flatten()
      |> Enum.map(fn d -> d.id end)

    device_ids ++ label_device_ids |> Enum.uniq()
  end

  defp get_associated_multi_buy_devices(id) do
    from(d in Device, where: d.multi_buy_id == ^id)
    |> Repo.all()
  end

  defp get_associated_multi_buy_labels(id) do
    from(l in Label, where: l.multi_buy_id == ^id)
    |> preload([:devices])
    |> Repo.all()
  end
end
