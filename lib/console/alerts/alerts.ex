defmodule Console.Alerts do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.Alert
  alias Console.Alerts.AlertNode
  alias Console.Organizations.Organization
  alias Console.Devices
  alias Console.Labels
  alias Console.Channels
  alias Console.Functions
  
  def get_alert!(id), do: Repo.get!(Alert, id)
  def get_alert(id), do: Repo.get(Alert, id)

  def get_alert!(organization, id) do
    Repo.get_by!(Alert, [id: id, organization_id: organization.id])
 end

  def get_alert_node!(alert_id, node_id, node_type) do
    Repo.get_by!(AlertNode, [alert_id: alert_id, node_id: node_id, node_type: node_type])
  end

  def create_alert(attrs \\ %{}) do
    %Alert{}
    |> Alert.changeset(attrs)
    |> Repo.insert()
  end

  def delete_alert(%Alert{} = alert) do
    Repo.delete(alert)
  end

  def update_alert(%Alert{} = alert, attrs) do
    alert
    |> Alert.changeset(attrs)
    |> Repo.update()
  end

  def add_alert_node(%Organization{} = organization, %Alert{} = alert, node_id, node_type) do
    case node_type do
      "device" ->
        Devices.get_device!(organization, node_id)
      "label" ->
        Labels.get_label!(organization, node_id)
      "integration" ->
        Channels.get_channel!(organization, node_id)
      "function" ->
        Functions.get_function!(organization, node_id)
    end

    alert_node = Repo.insert!(AlertNode.changeset(%AlertNode{}, %{ "alert_id" => alert.id, "node_id" => node_id, "node_type" => node_type }))

    {:ok, alert_node}
  end

  def remove_alert_node(%Organization{} = organization, %AlertNode{} = alert_node) do
    case alert_node.node_type do
      "device" ->
        Devices.get_device!(organization, alert_node.node_id)
      "label" ->
        Labels.get_label!(organization, alert_node.node_id)
      "integration" ->
        Channels.get_channel!(organization, alert_node.node_id)
      "function" ->
        Functions.get_function!(organization, alert_node.node_id)
    end
    
    Repo.delete(alert_node)
  end

  def get_alerts_by_node_and_event(node_id, node_type, event) do
    query = from a in Alert,
      join: an in AlertNode,
      on: an.alert_id == a.id,
      where: an.node_id == ^node_id
      and an.node_type == ^node_type
      and fragment("config ->> ? IS NOT NULL", ^event)

    Repo.all(query)
  end

  def get_alerts_by_label_node_and_event(label_ids, event) do
    query = from a in Alert,
      join: an in AlertNode,
      on: an.alert_id == a.id,
      where: an.node_id in ^label_ids
      and an.node_type == "label"
      and fragment("config ->> ? IS NOT NULL", ^event)
    
    Repo.all(query)
  end

  def get_alerts_by_event(event) do
    query = from a in Alert,
      where: fragment("config ->> ? IS NOT NULL", ^event)

    Repo.all(query)
  end

  def get_alerts_by_node(node_id, node_type) do
    query = from a in Alert,
      join: an in AlertNode,
      on: an.alert_id == a.id,
      where: an.node_id == ^node_id
      and an.node_type == ^node_type

    Repo.all(query)
  end

  def update_alert_last_triggered_at(%Alert{} = alert) do
    attrs = %{ "last_triggered_at" => Timex.now }
    
    alert
    |> Alert.changeset(attrs)
    |> Repo.update()
  end

  def delete_alert_nodes(node_id, node_type) do
    from(an in AlertNode, where: an.node_id == ^node_id and an.node_type == ^node_type) |> Repo.delete_all()
  end
end