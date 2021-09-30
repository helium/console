defmodule ConsoleWeb.ConfigProfileControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "config_profiles" do
    setup [:authenticate_user]

    test "creates config profiles properly", %{conn: conn} do
      resp_conn = post conn, config_profile_path(conn, :create), %{ "config_profile" => %{ "adr_allowed" => true, "cf_list_enabled" => false }}
      assert json_response(resp_conn, 422) == %{"errors" => %{"name" => ["Name cannot be blank"]}}

      resp_conn = post conn, config_profile_path(conn, :create), %{ "config_profile" => %{ "name" => "My Profile", "adr_allowed" => true, "cf_list_enabled" => false }}
      config_profile = json_response(resp_conn, 201)
      assert config_profile["name"] == "My Profile"
      assert config_profile["cf_list_enabled"] == false
      assert config_profile["adr_allowed"] == true
    end

    test "updates config profiles properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      config_profile_1 = insert(:config_profile, %{ organization_id: organization_id, name: "config profile name", adr_allowed: true, cf_list_enabled: false})

      resp_conn = put conn, config_profile_path(conn, :update, config_profile_1.id), %{ "config_profile" => %{ "name" => "", "adr_allowed" => false}}
      assert json_response(resp_conn, 422) == %{"errors" => %{"name" => ["Name cannot be blank"]}}

      resp_conn = put conn, config_profile_path(conn, :update, config_profile_1.id), %{ "config_profile" => %{ "name" => "some other name", "adr_allowed" => false}}
      config_profile = json_response(resp_conn, 200)
      assert config_profile["name"] == "some other name"
      assert config_profile["adr_allowed"] == false
      assert config_profile["cf_list_enabled"] == false

      resp_conn = put conn, config_profile_path(conn, :update, config_profile_1.id), %{ "config_profile" => %{ "cf_list_enabled" => true}}
      config_profile = json_response(resp_conn, 200)
      assert config_profile["name"] == "some other name"
      assert config_profile["adr_allowed"] == false
      assert config_profile["cf_list_enabled"] == true
    end

    test "deletes config profiles properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      config_profile_1 = insert(:config_profile, %{ name: "config profile name", adr_allowed: true, cf_list_enabled: true })
      assert_error_sent 404, fn ->
        delete conn, config_profile_path(conn, :delete, config_profile_1.id)
      end # does not delete config_profile not in own org

      config_profile_2 = insert(:config_profile, %{ organization_id: organization_id, name: "config_profile name", adr_allowed: true, cf_list_enabled: true })
      resp_conn = delete conn, config_profile_path(conn, :delete, config_profile_2.id)
      assert response(resp_conn, 204)
    end

    test "adds config profiles to nodes properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      config_profile_1 = insert(:config_profile, %{ organization_id: organization_id, name: "config profile name", adr_allowed: true, cf_list_enabled: false })
      device_1 = insert(:device, %{ organization_id: organization_id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111", oui: "2" })

      resp_conn = post conn, config_profile_path(conn, :add_config_profile_to_node, %{
        node_id: device_1.id,
        node_type: "device",
        config_profile_id: config_profile_1.id
      })
      assert response(resp_conn, 204)

      not_my_org = insert(:organization)
      not_my_device = insert(:device, %{ organization_id: not_my_org.id, dev_eui: "1111111111111112", app_eui: "1111111111111112", app_key: "11111111111121111111111111111111" })

      assert_error_sent 404, fn ->
        post conn, config_profile_path(conn, :add_config_profile_to_node, %{
          node_id: not_my_device.id,
          node_type: "device",
          config_profile_id: config_profile_1.id
        })
      end

      not_my_config_profile = insert(:config_profile, %{ organization_id: not_my_org.id, name: "some other config profile name", adr_allowed: false, cf_list_enabled: true })

      assert_error_sent 404, fn ->
        post conn, config_profile_path(conn, :add_config_profile_to_node, %{
          node_id: device_1.id,
          node_type: "device",
          config_profile_id: not_my_config_profile.id
        })
      end
    end

    test "removes config profiles from nodes properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      config_profile_1 = insert(:config_profile, %{ organization_id: organization_id, name: "config profile name", adr_allowed: true, cf_list_enabled: false })
      device_1 = insert(:device, %{ organization_id: organization_id, dev_eui: "1111111111111111", app_eui: "1111111111111111", app_key: "11111111111111111111111111111111", oui: "2", config_profile_id: config_profile_1.id })

      resp_conn = post conn, config_profile_path(conn, :remove_config_profile_from_node, %{
        config_profile_id: config_profile_1.id,
        node_id: device_1.id,
        node_type: "device"
      })
      assert response(resp_conn, 204)

      not_my_org = insert(:organization)
      not_my_config_profile = insert(:config_profile, %{ organization_id: not_my_org.id, name: "config profile name", adr_allowed: true, cf_list_enabled: false })
      not_my_device = insert(:device, %{ organization_id: not_my_org.id, dev_eui: "1121111111111111", app_eui: "1112111111111111", app_key: "11111211111111111111111111111111", config_profile_id: not_my_config_profile.id })

      assert_error_sent 404, fn ->
        post conn, config_profile_path(conn, :remove_config_profile_from_node, %{
          node_id: not_my_device.id,
          node_type: "device",
          config_profile_id: not_my_config_profile.id
        })
      end
    end
  end
end
