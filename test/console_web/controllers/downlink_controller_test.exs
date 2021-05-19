defmodule ConsoleWeb.DownlinkControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "channels" do
    setup [:authenticate_user]

    test "clears downlink queue successfully", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      device_1 = insert(:device, %{ organization_id: organization_id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })
      resp_conn = post conn, downlink_path(conn, :clear_downlink_queue), %{
        "device_id" => device_1.id
      }
      assert response(resp_conn, 204) # clears for single device

      device_2 = insert(:device, %{ organization_id: organization_id, dev_eui: "2222222222222222", app_eui: "2222222222222222", app_key: "22222222222222222222222222222222" })
      label_1 = insert(:label)
      insert(:devices_labels, %{ label_id: label_1.id, device_id: device_2.id })
      resp_conn = post conn, downlink_path(conn, :clear_downlink_queue), %{
        "label_id" => label_1.id
      }
      assert response(resp_conn, 204) # clears for label with one device

      label_2 = insert(:label)
      resp_conn = post conn, downlink_path(conn, :clear_downlink_queue), %{
        "label_id" => label_2.id
      }
      assert response(resp_conn, 400) # fails for label with no devices
    end
  end
end
