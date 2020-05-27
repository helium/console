defmodule Console.Factory do
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Organizations.Organization
  alias Console.ApiKeys.ApiKey
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Labels.ChannelsLabels
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Functions.Function
  alias Console.Organizations.Membership

  def user_factory do
    %{
      id: sequence(:id, &"abcdefghijklmnopqrstuvwxyz#{&1}"),
      email: sequence(:email, &"email-#{&1}@example.com"),
    }
  end

  def organization_factory do
    %Organization{
      name: sequence(:name, &"Organization #{&1}")
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

  def channels_labels_factory do
    %ChannelsLabels{}
  end

  def membership_factory do
    %Membership{}
  end
end
