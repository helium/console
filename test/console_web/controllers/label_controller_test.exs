defmodule ConsoleWeb.LabelControllerTest do
  use ConsoleWeb.ConnCase
  import Console.Factory

  alias Console.Labels

  describe "labels" do
    setup [:authenticate_user]

    test "adds labels to devices properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      device = insert(:device, %{ organization_id: organization_id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })

      resp_conn = post conn, label_path(conn, :add_devices_to_label), %{
        "devices" => [device.id],
        "new_label" => "some name for new label"
      }
      labels = Labels.get_device_labels(device.id)
      label = Labels.get_label_by_name("some name for new label", organization_id)
      assert label != nil
      assert response(resp_conn, 204)
      assert Enum.any?(labels, fn x -> x.label_id == label.id end) == true

      device_2 = insert(:device, %{ organization_id: organization_id, dev_eui: "1111111111111112", app_eui: "1111111111111112", app_key: "11111111111111111111111111111112" })

      resp_conn = post conn, label_path(conn, :add_devices_to_label), %{
        "devices" => [device_2.id],
        "new_label" => "some name for new label"
      }
      assert response(resp_conn, 400) # handles when label already exists
    end
  end
end