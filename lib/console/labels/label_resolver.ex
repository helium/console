defmodule Console.Labels.LabelResolver do
  alias Console.Repo
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    labels = Label
      |> where([l], l.organization_id == ^current_organization.id)
      |> preload([:devices, :label_notification_settings, :label_notification_webhooks])
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, labels}
  end

  def paginate_by_device(%{page: page, page_size: page_size, device_id: device_id, column: column, order: order}, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(order), String.to_existing_atom(column)}

    query = from l in Label,
      join: dl in DevicesLabels,
      on: dl.label_id == l.id,
      where: l.organization_id == ^current_organization.id and dl.device_id == ^device_id,
      order_by: ^order_by

    {:ok, query |> Repo.paginate(page: page, page_size: page_size)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    label = Ecto.assoc(current_organization, :labels) |> preload([:devices, :label_notification_settings, :label_notification_webhooks]) |> Repo.get!(id)

    {:ok, label}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    labels = Label
      |> where([l], l.organization_id == ^current_organization.id)
      |> preload([:label_notification_settings, :label_notification_webhooks])
      |> Repo.all()
      
    {:ok, labels}
  end
end
