defmodule ConsoleWeb.LabelNotificationWebhooksControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "label_notification_webhooks" do
    setup [:authenticate_user]

    test "adds webhooks properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      label_1 = insert(:label, %{ organization_id: organization_id })

      resp_conn = post conn, label_notification_webhooks_path(conn, :update), %{
        label_notification_webhooks: [%{
        "key" => "device_join_otaa_first_time",
        "url" => "http://hello.com",
        "value" => "1",
        "label_id" => label_1.id
        }]
      }
      resp = json_response(resp_conn, 200)
      assert List.first(resp["webhooks"])["label_id"] == label_1.id
    end

    test "updates webhooks properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      label_2 = insert(:label, %{ organization_id: organization_id })

      resp_conn = post conn, label_notification_webhooks_path(conn, :update), %{
        label_notification_webhooks: [%{
        "key" => "device_join_otaa_first_time",
        "url" => "http://howdy.com",
        "value" => "1",
        "label_id" => label_2.id
        }]
      }
      resp = json_response(resp_conn, 200)
      assert List.first(resp["webhooks"])["label_id"] == label_2.id

      resp_conn = post conn, label_notification_webhooks_path(conn, :update), %{
        label_notification_webhooks: [%{
        "key" => "device_join_otaa_first_time",
        "url" => "http://goodbye.com",
        "value" => "1",
        "label_id" => label_2.id
        }]
      }
      resp = json_response(resp_conn, 200)
      assert List.first(resp["webhooks"])["url"] == "http://goodbye.com"
    end
  end
end
