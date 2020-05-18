defmodule Console.Factory do
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Events.Event
  alias Console.Organizations.Organization
  alias Console.Organizations.Invitation
  alias Console.Gateways.Gateway

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
      app_key: "0000000011111111000000001111111",
      app_eui: "0000000011111111",
      dev_eui: sequence(:dev_eui, &"000000001111111#{&1}"),
      oui: "0"
    }
  end

  def organization_factory do
    %Organization{
      name: sequence(:name, &"Organization #{&1}")
    }
  end

  def invitation_factory do
    %Invitation{
      email: sequence(:email, &"email-#{&1}@example.com"),
      role: sequence(:role, ~w(admin manager read)),
      token: sequence(:token, &"TOKEN-#{&1}")
    }
  end
end
