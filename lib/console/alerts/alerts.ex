defmodule Console.Alerts do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.Alert
  alias Console.Alerts.AlertNodes
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
    Repo.get_by!(AlertNodes, [alert_id: alert_id, node_id: node_id, node_type: node_type])
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
      "group" ->
        Labels.get_label!(organization, node_id)
      "integration" ->
        Channels.get_channel!(organization, node_id)
      "function" ->
        Functions.get_function!(organization, node_id)
    end

    alert_node = Repo.insert!(AlertNodes.changeset(%AlertNodes{}, %{ "alert_id" => alert.id, "node_id" => node_id, "node_type" => node_type }))

    {:ok, alert_node}
  end

  def remove_alert_node(%Organization{} = organization, %AlertNodes{} = alert_node) do
    case alert_node.node_type do
      "device" ->
        Devices.get_device!(organization, alert_node.node_id)
      "group" ->
        Labels.get_label!(organization, alert_node.node_id)
      "integration" ->
        Channels.get_channel!(organization, alert_node.node_id)
      "function" ->
        Functions.get_function!(organization, alert_node.node_id)
    end
    
    Repo.delete(alert_node)
  end
end