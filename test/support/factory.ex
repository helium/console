defmodule Console.Factory do
  import Plug.Conn
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Organizations
  alias Console.Organizations.Organization
  alias Console.ApiKeys.ApiKey
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Functions.Function
  alias Console.Organizations.Membership
  alias Console.Alerts.Alert
  alias Console.Alerts.AlertNode
  alias Console.Flows.Flow
  alias Console.ConfigProfiles.ConfigProfile

  def authenticate_user(%{conn: conn}) do
    user = params_for(:user)
    {:ok, organization} = Organizations.create_organization(user, params_for(:organization))
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", user.id <> " " <> user.email)
           |> put_req_header("organization", organization.id)
    {:ok, conn: conn}
  end

  def user_factory do
    %{
      id: sequence(:id, &"abcdefghijklmnopqrstuvwxyz#{&1}"),
      email: sequence(:email, &"email-#{&1}@example.com"),
    }
  end

  def organization_factory do
    %Organization{
      name: sequence(:name, &"Organization #{&1}"),
      webhook_key: "some_valid_key",
      default_app_eui: "some_app_eui"
    }
  end

  def api_key_factory do
    %ApiKey{
      name: sequence(:name, &"Api Key #{&1}"),
      role: "admin",
      key: "key",
      user_id: "me"
    }
  end

  def flow_factory do
    %Flow{}
  end

  def label_factory do
    %Label{
      name: sequence(:name, &"Label #{&1}"),
    }
  end

  def channel_factory do
    %Channel{
      active: true,
      credentials: %{"a field" => "a value"},
      name: sequence(:name, &"My Channel #{&1}"),
      type_name: "Azure IoT Hub",
      type: "azure"
    }
  end

  def device_factory do
    %Device{
      name: "My Device",
      app_key: sequence(:dev_eui, &"000000001111111100000000111111#{&1}"),
      app_eui: sequence(:dev_eui, &"000000001111111#{&1}"),
      dev_eui: sequence(:dev_eui, &"000000001111111#{&1}"),
    }
  end

  def function_factory do
    %Function{
      name: "My Function",
      type: "decoder",
      format: "custom",
      body: "none",
    }
  end

  def devices_labels_factory do
    %DevicesLabels{}
  end

  def membership_factory do
    %Membership{}
  end

  def alert_factory do
    %Alert{}
  end

  def alert_node_factory do
    %AlertNode{}
  end

  def config_profile_factory do
    %ConfigProfile{}
  end
end
