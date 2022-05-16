defmodule ConsoleWeb.ChannelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  alias Console.Channels
  alias Console.Functions
  alias Console.Organizations

  describe "channels" do
    setup [:authenticate_user]

    test "creates channels properly", %{conn: conn} do
      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "name" => "channel", "type" => "http" }
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{ "credentials" => ["can't be blank"] }} # no required attrs

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "type" => "http" }
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{ "name" => ["Name cannot be blank"] }} # no required attrs

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel" }
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{ "type" => ["can't be blank"] }} # no required attrs

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel", "type" => "http2" }
      }
      assert json_response(resp_conn, 422) # type not valid

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel", "type" => "aws" }
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token == nil # downlink token only for http

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel", "type" => "azure" }
      }
      assert json_response(resp_conn, 422) # name already used

      assert_error_sent 500, fn ->
        post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{ "method" => "post" }, "name" => "http_channel", "type" => "http" }
        }
      end # invalid http credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "google.com" }, "name" => "http_channel", "type" => "http" }
      }
      assert json_response(resp_conn, 422) # invalid http credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "http://google.com", "method" => "post" }, "name" => "http_channel", "type" => "http" }
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token != nil # downlink token only for http

      assert_error_sent 500, fn ->
        post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "mqtt_channel", "type" => "mqtt" }
        }
      end # invalid mqtt credentials

      assert_error_sent 500, fn ->
        post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://m1.helium.com" }, "name" => "mqtt_channel", "type" => "mqtt" }
        }
      end # invalid mqtt credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "m1.helium.com", "topic" => "yes"}, "name" => "mqtt_channel", "type" => "mqtt" }
      }
      assert json_response(resp_conn, 422) # invalid mqtt credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://m1.helium.com", "uplink" => %{"topic" => "yes"}, "downlink" => %{"topic" => "yes"}}, "name" => "mqtt_channel", "type" => "mqtt" }
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token == nil # downlink token only for http
    end

    test "creates adafruit channels properly", %{conn: conn} do
      organization_id = conn |> get_req_header("organization") |> List.first()
      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_id}}/json" }, "downlink" => %{ topic: "helium/{{device_id}}/tx" } }, "name" => "adafruit", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      assert channel["name"] == "adafruit"

      post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_id}}/json" }, "downlink" => %{ topic: "helium/{{device_id}}/tx" } }, "name" => "adafruit2", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      function = Functions.get_function_by_name("adafruit2")
      assert function != nil # corresponding function is created

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_id}}/json" }, "downlink" => %{ topic: "helium/{{device_id}}/tx" } }, "name" => "adafruit3", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      function = Functions.get_function_by_name("adafruit3")
      organization = Organizations.get_organization(organization_id)
      # corresponding (incomplete) flow is created in organization
      assert organization.flow["channel-#{channel.id}"] != nil
      assert organization.flow["function-#{function.id}"] != nil
      assert Enum.find(organization.flow["edges"], fn e ->
        e["source"] == "function-#{function.id}" and e["target"] == "channel-#{channel.id}"
      end) != nil

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_name}}/json" }, "downlink" => %{ topic: "user" } }, "name" => "adafruit4", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      assert channel["name"] == "adafruit4" # can create channel with {{device_name}} in uplink topic instead
    end

    test "updates channels properly", %{conn: conn} do
      not_my_channel = insert(:channel)
      assert_error_sent 404, fn ->
        put conn, channel_path(conn, :update, not_my_channel.id), %{ "channel" => %{ "name" => "channel2" }}
      end # does not update channel not in own org

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "method" => "post", "endpoint" => "http://google.com" }, "name" => "channel", "type" => "http" }
      }
      channel = json_response(resp_conn, 201)
      assert channel["name"] == "channel"

      resp_conn = put conn, channel_path(conn, :update, channel["id"]), %{ "channel" => %{ "name" => "channel2" }}
      channel = json_response(resp_conn, 200)
      assert channel["name"] == "channel2" # updating name

      resp_conn = put conn, channel_path(conn, :update, channel["id"]), %{ "channel" => %{ "type" => "http" }}
      channel = json_response(resp_conn, 200)
      assert channel["type"] == "http" # updating type does nothing

      channel = Channels.get_channel!(channel["id"])
      original_downlink = channel.downlink_token

      resp_conn = put conn, channel_path(conn, :update, channel.id), %{ "channel" => %{ "downlink_token" => "new" }}
      channel = json_response(resp_conn, 200)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token != original_downlink # updating downlink token works
    end

    test "delete channels properly", %{conn: conn} do
      not_my_channel = insert(:channel)
      assert_error_sent 404, fn ->
        delete conn, channel_path(conn, :delete, not_my_channel.id)
      end # does not delete channel not in own org

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "http://google.com", "method" => "post" }, "name" => "channel", "type" => "http" }
      }
      channel = json_response(resp_conn, 201)

      assert Channels.get_channel(channel["id"]) != nil

      resp_conn = delete conn, channel_path(conn, :delete, channel["id"])
      channel = json_response(resp_conn, 200)

      assert Channels.get_channel(channel["id"]) == nil
    end
  end
end
