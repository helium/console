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

  # def update(conn, %{"id" => id, "device" => device_params}) do
  #   current_organization = conn.assigns.current_organization
  #   device = Devices.get_device!(id)
  #
  #   with {:ok, %Device{} = device} <- Devices.update_device(device, device_params) do
  #     broadcast(device, device.id)
  #
  #     conn
  #     |> put_resp_header("message", "#{device.name} updated successfully")
  #     |> render("show.json", device: device)
  #   end
  # end
  #
  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    label = Labels.get_label!(id)

    with {:ok, %Label{} = label} <- Labels.delete_label(label) do

      conn
      |> put_resp_header("message", "#{label.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end
end
