defmodule ConsoleWeb.V1DeviceControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.Devices

  describe "devices" do
    test "inactive api keys do not work", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      api_key = insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key)
      })
      assert api_key.active == false

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices")
      assert response(resp_conn, 401) == "{\"message\":\"api_key_needs_email_verification\"}"
    end

    test "CRUD actions work properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      conn = build_conn() |> get("/api/v1/devices")
      assert response(conn, 401) # no api key

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices")
      assert json_response(resp_conn, 200) == [] # returns no devices when no devices created in org

      assert_error_sent 400, fn ->
        build_conn()
          |> put_req_header("key", key)
          |> post("/api/v1/devices", %{ "name" => "device", "dev_eui" => "1", "app_eui" => "2" })
      end # not all device attrs in body

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          "name" => "device",
          "dev_eui" => "1",
          "app_eui" => "2",
          "app_key" => "3"
        })
      assert response(resp_conn, 422) # attrs must be valid, lengths need to be respected

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          "name" => "device",
          "dev_eui" => "1111111111111111",
          "app_eui" => "1111111111111111",
          "app_key" => "11111111111111111111111111111111"
        })
      device = json_response(resp_conn, 201) # device created

      organization_2 = insert(:organization)
      device_2 = insert(:device, %{ organization_id: organization_2.id, dev_eui: "2222222222222222", app_eui: "2222222222222222", app_key: "22222222222222222222222222222222" })

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices")
      assert json_response(resp_conn, 200) |> length() == 1
      assert json_response(resp_conn, 200) |> List.first() |> Map.get("id") == device["id"] # index only shows our devices in our org

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("id") == device["id"] # device show gives back our device

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device_2.id}")
      assert json_response(resp_conn, 404) # device show does not give back other org devices

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device_2.id}")
      assert json_response(resp_conn, 404) # device show does not give back other org devices

      assert Devices.get_device(device["id"]) != nil
      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device["id"]}")
      assert response(resp_conn, 200) # device show does not give back other org devices
      assert Devices.get_device(device["id"]) == nil

      config_profile = insert(:config_profile, %{ name: "new pf", organization_id: organization.id})
      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          dev_eui: "a222222222222222",
          app_eui: "a222222222222222",
          app_key: "a2222222222222222222222222222222",
          config_profile_id: config_profile.id,
          name: "test device"
        })
      device = json_response(resp_conn, 201) # device created with config_profile
      assert device["config_profile_id"] == config_profile.id

      resp_conn = build_conn() |> put_req_header("key", key) |> delete("/api/v1/devices/#{device["id"]}")
      assert response(resp_conn, 200)

      label1 = insert(:label, %{ name: "l1", organization_id: organization.id})
      label2 = insert(:label, %{ name: "l2", organization_id: organization.id})

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          dev_eui: "a222222222222222",
          app_eui: "a222222222222222",
          app_key: "a2222222222222222222222222222222",
          config_profile_id: config_profile.id,
          labels: [label1.id, label2.id],
          name: "test device"
        })
      json_response(resp_conn, 201) # device created with config_profile
    end

    test "setting config profile works", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })
      config_profile = insert(:config_profile, %{ name: "new pf", organization_id: organization.id})

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          "name" => "device",
          "dev_eui" => "1111111111111111",
          "app_eui" => "1111111111111111",
          "app_key" => "11111111111111111111111111111111"
        })
      device = json_response(resp_conn, 201) # device created
      assert device["config_profile_id"] == nil

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/#{device["id"]}", %{
          "config_profile_id" => config_profile.id,
        })
      assert response(resp_conn, 200) # set config profile

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("config_profile_id") == config_profile.id

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/#{device["id"]}", %{
          "config_profile_id" => nil,
        })
      assert response(resp_conn, 200) # set config profile nil

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("config_profile_id") == nil
    end

    test "setting active/inactive works", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          "name" => "device",
          "dev_eui" => "1111111111111111",
          "app_eui" => "1111111111111111",
          "app_key" => "11111111111111111111111111111111"
        })
      device = json_response(resp_conn, 201) # device created

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/#{device["id"]}", %{
          "active" => false,
        })
      assert response(resp_conn, 200) # set inactive

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("active") == false

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/#{device["id"]}", %{
          "active" => true,
        })
      assert response(resp_conn, 200) # set active

      resp_conn = build_conn() |> put_req_header("key", key) |> get("/api/v1/devices/#{device["id"]}")
      assert json_response(resp_conn, 200) |> Map.get("active") == true
    end

    test "setting active/inactive works for device creds", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{
          "name" => "device",
          "dev_eui" => "1111111111111111",
          "app_eui" => "1111111111111111",
          "app_key" => "11111111111111111111111111111111"
        })
      device = json_response(resp_conn, 201) # device created

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/active?dev_eui=1111111111111111", %{
          "active" => false,
        })
      assert response(resp_conn, 200) # set inactive
      assert Devices.get_device!(device["id"]).active == false

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/active?dev_eui=1111111111111111&app_eui=1111111111111111", %{
          "active" => true,
        })
      assert response(resp_conn, 200) # set active
      assert Devices.get_device!(device["id"]).active == true

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/active?dev_eui=1111111111111111&app_eui=1111111111111111&app_key=11111111111111111111111111111111", %{
          "active" => false,
        })
      assert response(resp_conn, 200) # set inactive
      assert Devices.get_device!(device["id"]).active == false

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/active?dev_eui=1111111111111110", %{
          "active" => false,
        })
      assert response(resp_conn, 404)

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/active?dev_eui=1111111111111121&app_eui=1111111111111111", %{
          "active" => true,
        })
      assert response(resp_conn, 404)

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> put("/api/v1/devices/active?dev_eui=1111111511111111&app_eui=1111111111111111&app_key=11111111111111111111111111111111", %{
          "active" => false,
        })
      assert response(resp_conn, 404)
    end

    test "discovery mode endpoint works properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization, %{
        name: "Discovery Mode (Helium)"
      })
      insert(:api_key, %{
        organization_id: organization.id,
        active: true,
        key: :crypto.hash(:sha256, key)
      })
      label = insert(:label, %{
        name: "Discovery Mode",
        organization_id: organization.id
      })

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/devices/discover", %{
        "hotspot_name" => "some-hotspot-name",
        "hotspot_address" => "hotspot_address",
        "transaction_id" => "transaction_id",
        "signature" => "signature"
      })
      assert response(resp_conn, 200)

      created_device = List.first(Devices.get_devices_for_label(label.id))
      assert created_device != nil
      assert created_device.name == "some-hotspot-name"
      assert created_device.hotspot_address == "hotspot_address"

      resp_conn = build_conn() |> put_req_header("key", key) |> post("/api/v1/devices/discover", %{
        "hotspot_name" => "some-hotspot-name",
        "hotspot_address" => "hotspot_address",
        "transaction_id" => "transaction_id",
        "signature" => "signature"
      })
      assert response(resp_conn, 200)

      organization_2 = insert(:organization) # not the discovery mode helium org
      key_2 = "dqWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      insert(:api_key, %{
        organization_id: organization_2.id,
        active: true,
        key: :crypto.hash(:sha256, key_2)
      })
      resp_conn = build_conn() |> put_req_header("key", key_2) |> post("/api/v1/devices/discover", %{
        "hotspot_address" => "some_other_hotspot_address",
        "transaction_id" => "transaction_id",
        "signature" => "signature",
        "hotspot_name" => "some-other-hotspot-name"
      })
      assert response(resp_conn, 403)
    end

    test "batch device creation works properly", %{conn: _conn} do
      key = "upWpTb/J1mCsZupZTFL52tB27QJ2hFNWtT6PvwriQgs"
      organization = insert(:organization)
      insert(:api_key, %{
        organization_id: organization.id,
        key: :crypto.hash(:sha256, key),
        active: true
      })

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{ devices: [%{ "name" => "device", "dev_eui" => "1", "app_eui" => "2" }] })
      results = json_response(resp_conn, 200)
      assert results["success"] == [] # not all device attrs in body

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{ devices: [%{
          "name" => "device",
          "dev_eui" => "1",
          "app_eui" => "2",
          "app_key" => "3"
        }]})
      results = json_response(resp_conn, 200)
      assert results["success"] == [] # attrs must be valid, lengths need to be respected

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{ devices: [
          %{
            "name" => "device1",
            "dev_eui" => "1111111111111111",
            "app_eui" => "1111111111111111",
            "app_key" => "11111111111111111111111111111111"
          },
          %{
            "name" => "device2",
            "dev_eui" => "2111111111111111",
            "app_eui" => "2111111111111111",
            "app_key" => "21111111111111111111111111111111"
          }
        ]})
      results = json_response(resp_conn, 200)
      assert length(results["success"]) == 2 # devices created

      config_profile = insert(:config_profile, %{ name: "new pf", organization_id: organization.id})
      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{ devices: [%{
          dev_eui: "a222222222222222",
          app_eui: "a222222222222222",
          app_key: "a2222222222222222222222222222222",
          config_profile_id: config_profile.id,
          name: "test device"
        }]})
      results = json_response(resp_conn, 200)
      assert List.first(results["success"])["config_profile_id"] == config_profile.id # device created with config_profile

      label1 = insert(:label, %{ name: "l1", organization_id: organization.id})
      label2 = insert(:label, %{ name: "l2", organization_id: organization.id})

      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{ devices: [%{
          dev_eui: "b222222222222222",
          app_eui: "b222222222222222",
          app_key: "b2222222222222222222222222222222",
          config_profile_id: config_profile.id,
          label_ids: [label1.id, label2.id],
          name: "test device"
        }]})
      results = json_response(resp_conn, 200)
      # device created with labels
      assert %{ "id" => label1.id, "name" => "l1" } in List.first(results["success"])["labels"] 
      assert %{ "id" => label2.id, "name" => "l2" } in List.first(results["success"])["labels"]

      not_my_organization = insert(:organization)
      not_my_label = insert(:label, %{ name: "not_my_label1", organization_id: not_my_organization.id})
      not_my_config_profile = insert(:config_profile, %{ name: "new pf", organization_id: not_my_organization.id})
      resp_conn = build_conn()
        |> put_req_header("key", key)
        |> post("/api/v1/devices", %{ devices: [
          %{
            dev_eui: "c222222222222222",
            app_eui: "c222222222222222",
            app_key: "c2222222222222222222222222222222",
            config_profile_id: config_profile.id,
            label_ids: [not_my_label.id],
            name: "test failing device"
          },
          %{
            dev_eui: "d222222222222222",
            app_eui: "d222222222222222",
            app_key: "d2222222222222222222222222222222",
            label_ids: [label1.id],
            name: "test not failing device"
          },
          %{
            dev_eui: "e222222222222222",
            app_eui: "e222222222222222",
            app_key: "e2222222222222222222222222222222",
            config_profile_id: not_my_config_profile.id,
            name: "test failing device 2"
          }
        ]})
      results = json_response(resp_conn, 200)
      assert length(results["success"]) == 1 # one should succeed to be created
      assert length(results["failure"]) == 2 # two should fail to be created_device
    end
  end
end
