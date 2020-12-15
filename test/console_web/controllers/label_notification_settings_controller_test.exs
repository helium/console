defmodule ConsoleWeb.LabelNotificationSettingsControllerTest do
  use ConsoleWeb.ConnCase
  
  import Console.FactoryHelper
  import Console.Factory

  alias Console.LabelNotificationSettings

  describe "label_notification_settings" do
    setup [:authenticate_user]

    test "adds settings properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      label_1 = insert(:label, %{ organization_id: organization_id })

      resp_conn = post conn, label_notification_settings_path(conn, :update), %{
        "label_notification_settings": [%{
        "key" => "device_join_otaa_first_time",
        "recipients" => "admin",
        "value" => "1",
        "label_id" => label_1.id
        }]
      }
      resp = json_response(resp_conn, 200)
      assert List.first(resp["settings"])["label_id"] == label_1.id
    end

    test "updates settings properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      label_2 = insert(:label, %{ organization_id: organization_id })

      resp_conn = post conn, label_notification_settings_path(conn, :update), %{
        "label_notification_settings": [%{
        "key" => "device_join_otaa_first_time",
        "recipients" => "admin",
        "value" => "0",
        "label_id" => label_2.id
        }]
      }
      resp = json_response(resp_conn, 200)
      assert List.first(resp["settings"])["label_id"] == label_2.id

      resp_conn = post conn, label_notification_settings_path(conn, :update), %{
        "label_notification_settings": [%{
        "key" => "device_join_otaa_first_time",
        "recipients" => "admin",
        "value" => "1",
        "label_id" => label_2.id
        }]
      }
      assert List.first(resp["settings"])["value"] == "0"
    end
  end
end