defmodule ConsoleWeb.ChannelControllerTest do
  use ConsoleWeb.ConnCase

  import Console.FactoryHelper
  import Console.Factory

  alias Console.Channels
  alias Console.Functions

  describe "channels" do
    setup [:authenticate_user]

    test "creates channels properly", %{conn: conn} do
      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "name" => "channel", "type" => "http" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{ "credentials" => ["can't be blank"] }} # no required attrs

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "type" => "http" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{ "name" => ["can't be blank"] }} # no required attrs

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) == %{"errors" => %{ "type" => ["can't be blank"] }} # no required attrs

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel", "type" => "http2" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) # type not valid

      assert_error_sent 400, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "http", "type" => "http" }
        }
      end # does not have labels attr in payload

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel", "type" => "aws" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token == nil # downlink token only for http

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel", "type" => "azure" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) # name already used

      assert_error_sent 500, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "http_channel", "type" => "http" },
          "labels" => %{"labelsApplied" => [], "newLabels" => []}
        }
      end # invalid http credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "google.com" }, "name" => "http_channel", "type" => "http" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) # invalid http credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "http://google.com" }, "name" => "http_channel", "type" => "http" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token != nil # downlink token only for http

      assert_error_sent 500, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "mqtt_channel", "type" => "mqtt" },
          "labels" => %{"labelsApplied" => [], "newLabels" => []}
        }
      end # invalid mqtt credentials

      assert_error_sent 500, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://m1.helium.com" }, "name" => "mqtt_channel", "type" => "mqtt" },
          "labels" => %{"labelsApplied" => [], "newLabels" => []}
        }
      end # invalid mqtt credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "m1.helium.com", "topic" => "yes"}, "name" => "mqtt_channel", "type" => "mqtt" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      assert json_response(resp_conn, 422) # invalid mqtt credentials

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://m1.helium.com", "uplink" => %{"topic" => "yes"}, "downlink" => %{"topic" => "yes"}}, "name" => "mqtt_channel", "type" => "mqtt" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      assert channel.downlink_token == nil # downlink token only for http
    end

    test "creates adafruit channels properly", %{conn: conn} do
      resp_conn = post conn, channel_path(conn, :create), %{ 
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_id}}/json" }, "downlink" => %{ "topic": "helium/{{device_id}}/tx" } }, "name" => "adafruit", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      assert channel["name"] == "adafruit"

      resp_conn = post conn, channel_path(conn, :create), %{ 
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_id}}/json" }, "downlink" => %{ "topic": "helium/{{device_id}}/tx" } }, "name" => "adafruit2", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      channel = channel |> Channels.fetch_assoc([:labels])
      [head] = channel.labels
      assert head.name == "adafruit2" # has label with same name as channel
      
      resp_conn = post conn, channel_path(conn, :create), %{ 
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_id}}/json" }, "downlink" => %{ "topic": "helium/{{device_id}}/tx" } }, "name" => "adafruit3", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      function = Functions.get_function_by_name(channel["name"])
      assert function.body == "Default Cayenne Function" # has cayenne function with same name as channel
      function = function |> Functions.fetch_assoc([:labels])
      [head] = function.labels
      assert head.name == "adafruit3" # function has label with same name as channel

      resp_conn = post conn, channel_path(conn, :create), %{ 
        "channel" => %{ "credentials" => %{ "endpoint" => "mqtt://adafruit:adafruit@io.adafruit:9933", "uplink" => %{ "topic" => "user/groups/{{device_name}}/json" }, "downlink" => %{ "topic": "user" } }, "name" => "adafruit4", "type" => "mqtt" },
        "func" => %{"format" => "cayenne"}
      }
      channel = json_response(resp_conn, 201)
      assert channel["name"] == "adafruit4"
    end

    test "create channels with labels linked properly", %{conn: conn} do
      # channel is still created even if labels do not parse by design
      assert_error_sent 500, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "channel2", "type" => "google" },
          "labels" => []
        }
      end # labels attr invalid type

      assert_error_sent 400, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "channel3", "type" => "google" },
          "labels" => %{"labelsApplied" => [%{"id" => 1}]}
        }
      end # labels attr content invalid type

      assert_error_sent 400, fn ->
        resp_conn = post conn, channel_path(conn, :create), %{
          "channel" => %{ "credentials" => %{}, "name" => "channel4", "type" => "google" },
          "labels" => %{"labelsApplied" => [%{"id" => 'gjkahksf'}]}
        }
      end # labels attr content invalid type

      organization_id = conn |> get_req_header("organization") |> List.first()
      label_1 = insert(:label, %{ organization_id: organization_id })
      label_2 = insert(:label, %{ organization_id: organization_id })
      label_3 = insert(:label) # not inserted into same organization
      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{}, "name" => "channel5", "type" => "google" },
        "labels" => %{"labelsApplied" => [%{"id" => label_1.id}, %{"id" => label_2.id}]}
      }
      channel = json_response(resp_conn, 201)
      channel = Channels.get_channel!(channel["id"])
      channel = channel |> Channels.fetch_assoc([:labels])

      assert Enum.find(channel.labels, fn l -> l.id == label_1.id end)
      assert Enum.find(channel.labels, fn l -> l.id == label_2.id end)
      assert Enum.find(channel.labels, fn l -> l.id == label_3.id end) == nil
    end

    test "updates channels properly", %{conn: conn} do
      not_my_channel = insert(:channel)
      assert_error_sent 404, fn ->
        resp_conn = put conn, channel_path(conn, :update, not_my_channel.id), %{ "channel" => %{ "name" => "channel2" }}
      end # does not update channel not in own org

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "http://google.com" }, "name" => "channel", "type" => "http" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
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
        resp_conn = delete conn, channel_path(conn, :delete, not_my_channel.id)
      end # does not delete channel not in own org

      resp_conn = post conn, channel_path(conn, :create), %{
        "channel" => %{ "credentials" => %{ "endpoint" => "http://google.com" }, "name" => "channel", "type" => "http" },
        "labels" => %{"labelsApplied" => [], "newLabels" => []}
      }
      channel = json_response(resp_conn, 201)

      assert Channels.get_channel(channel["id"]) != nil

      resp_conn = delete conn, channel_path(conn, :delete, channel["id"])
      channel = json_response(resp_conn, 200)

      assert Channels.get_channel(channel["id"]) == nil
    end
  end
end
