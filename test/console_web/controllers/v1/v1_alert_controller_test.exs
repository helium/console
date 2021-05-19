defmodule ConsoleWeb.V1AlertControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "alerts" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/alerts")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end

    test "create alert work properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      assert_error_sent 500, fn ->
        build_conn() |> post("/api/v1/alerts")
      end # no api key attached

      assert_error_sent 400, fn ->
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/alerts", %{ "config" => %{ "device_deleted" => %{ "email" => %{ "recipient" => "all" }}}, "node_type" => "device/label" })
      end # not all alert attrs in body

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/alerts", %{
          "name" => "some alert",
          "config" => %{
            "device_deleted" => %{
              "email" => %{
                "incorrect_key" => "admin"
              }
            }
          },
          "node_type" => "device/label"
        })
      assert response(resp_conn, 422) # confir format must be valid

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/alerts", %{
          "name" => "some alert",
          "config" => %{
            "device_deleted" => %{
              "email" => %{
                "recipient" => "incorrect_recipient"
              }
            }
          },
          "node_type" => "device/label"
        })
      assert response(resp_conn, 422) # confir format must be valid

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/alerts", %{
          "name" => "some alert",
          "config" => %{
            "device_deleted" => %{
              "email" => %{
                "recipient" => "incorrect_recipient"
              },
              "some_incorrect_type" => "hello"
            }
          },
          "node_type" => "device/label"
        })
      assert response(resp_conn, 422) # confir format must be valid

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/alerts", %{
          "name" => "some alert",
          "config" => %{
            "device_deleted" => %{
              "email" => %{
                "recipient" => "admin"
              }
            }
          },
          "node_type" => "device/label"
        })
      assert response(resp_conn, 201) # alert created
    end

    test "delete alert work properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      alert_1 = insert(:alert, %{ organization_id: organization.id, name: "alert name", node_type: "integration", config: %{
        "device_join_otaa_first_time" => %{"email" => %{"recipient" => "admin"}}
      } })

      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> delete("/api/v1/alerts/#{alert_1.id}")
      assert response(resp_conn, 200)

      not_my_alert = insert(:alert, %{ name: "alert name", node_type: "integration", config: %{
        "device_join_otaa_first_time" => %{"email" => %{"recipient" => "admin"}}
      } })
      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> delete("/api/v1/alerts/#{not_my_alert.id}")
      assert response(resp_conn, 404) # unable to delete another org's alert
    end

    test "adding alert to node works properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      alert_1 = insert(:alert, %{ organization_id: organization.id, name: "alert name", node_type: "integration", config: %{
        "device_join_otaa_first_time" => %{"email" => %{"recipient" => "admin"}}
      } })
      device = insert(:device, %{ organization_id: organization.id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })

      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/alerts/add_to_node", %{
            "alert_id" => alert_1.id,
            "node_id" => device.id,
            "node_type" => "device"
          })
      assert response(resp_conn, 200)

      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/alerts/add_to_node", %{
            "alert_id" => alert_1.id,
            "node_id" => device.id,
            "node_type" => "device"
          })
      assert response(resp_conn, 400) #cannot add to an already attached node
    end

    test "removing alert from node works properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      alert_1 = insert(:alert, %{ organization_id: organization.id, name: "alert name", node_type: "integration", config: %{
        "device_join_otaa_first_time" => %{"email" => %{"recipient" => "admin"}}
      } })
      device = insert(:device, %{ organization_id: organization.id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111" })
      insert(:alert_node, %{ alert_id: alert_1.id, node_id: device.id, node_type: "device" })

      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/alerts/remove_from_node", %{
            "alert_id" => alert_1.id,
            "node_id" => device.id,
            "node_type" => "device"
          })
      assert response(resp_conn, 200)

      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/alerts/remove_from_node", %{
            "alert_id" => alert_1.id,
            "node_id" => device.id,
            "node_type" => "device"
          })
      assert response(resp_conn, 404) #cannot remove from a node that is not attached
    end

    test "updating alert works properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      alert_1 = insert(:alert, %{ organization_id: organization.id, name: "alert name", node_type: "integration", config: %{
        "device_join_otaa_first_time" => %{"email" => %{"recipient" => "admin"}}
      } })

      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> put("/api/v1/alerts/#{alert_1.id}", %{
            "alert" => %{
              "name" => "some other alert name"
            }
        })
      assert response(resp_conn, 200)

      not_my_alert = insert(:alert, %{ name: "alert name", node_type: "integration", config: %{
        "device_join_otaa_first_time" => %{"email" => %{"recipient" => "admin"}}
      } })
      resp_conn =
        build_conn()
          |> put_req_header("key", key)
          |> put("/api/v1/alerts/#{not_my_alert.id}", %{
            "alert" => %{
              "name" => "different name"
            }
          })
      assert response(resp_conn, 404) # unable to delete another org's alert
    end
  end
end
