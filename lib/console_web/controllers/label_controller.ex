defmodule ConsoleWeb.LabelController do
  use ConsoleWeb, :controller

  alias Console.Labels
  alias Console.Labels.Label

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"label" => label_params}) do
    current_organization = conn.assigns.current_organization
    label_params = Map.merge(label_params, %{"organization_id" => current_organization.id})

    with {:ok, %Label{} = label} <- Labels.create_label(label_params) do
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

      conn
      |> put_resp_header("message", "#{label.name} updated successfully")
      |> render("show.json", label: label)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(id)

    with {:ok, %Label{} = label} <- Labels.delete_label(label) do

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

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end
end
