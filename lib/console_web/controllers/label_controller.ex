defmodule ConsoleWeb.LabelController do
  use ConsoleWeb, :controller

  alias Console.Labels
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"label" => label_params}) do
    current_organization = conn.assigns.current_organization
    label_params = Map.merge(label_params, %{"organization_id" => current_organization.id})

    with {:ok, %Label{} = label} <- Labels.create_label(label_params) do
      broadcast(label)

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "#{label.name} created successfully")
      |> render("show.json", label: label)
    end
  end

  def update(conn, %{"id" => id, "label" => label_params}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(id)

    with {:ok, %Label{} = label} <- Labels.update_label(label, label_params) do
      broadcast(label, label.id)
      conn
      |> put_resp_header("message", "#{label.name} updated successfully")
      |> render("show.json", label: label)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(id)

    with {:ok, %Label{} = label} <- Labels.delete_label(label) do
      broadcast(label)

      conn
      |> put_resp_header("message", "#{label.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def add_devices_to_label(conn, %{"devices" => devices, "labels" => labels, "to_label" => to_label}) do
    current_organization = conn.assigns.current_organization

    if length(devices) == 0 and length(labels) == 0 do
      {:error, :bad_request, "Please select a device or label"}
    else
      with {:ok, count} <- Labels.add_devices_to_label(devices, labels, to_label, current_organization) do
        msg =
          case count do
            0 -> "All selected devices are already in label"
            _ -> "#{count} Devices added to label successfully"
          end

        label = Labels.get_label!(to_label)
        broadcast(label, label.id)

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end

  def delete_devices_from_label(conn, %{"devices" => devices, "label_id" => label_id}) do
    with {_, nil} <- Labels.delete_devices_labels(devices, label_id) do
      label = Labels.get_label!(label_id)
      broadcast(label, label.id)

      conn
      |> put_resp_header("message", "Device(s) successfully removed from label")
      |> send_resp(:no_content, "")
    end
  end

  defp broadcast(%Label{} = label) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_added: "#{label.organization_id}/label_added")
  end

  defp broadcast(%Label{} = label, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_updated: "#{label.organization_id}/#{id}/label_updated")
  end
end
