defmodule Console.Factory do
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Auth.User
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Events.Event
  alias Console.Organizations.Organization
  alias Console.Organizations.Invitation
  alias Console.Gateways.Gateway

  def user_factory do
    %User{
      email: sequence(:email, &"email-#{&1}@example.com"),
      password_hash: "$2b$12$8JVaQdWzTkKYJoEtORLwx.BrIWMfRZQ.0loabtPw38Y2aV9geMgt6",
      confirmed_at: NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)
    }
  end

  def unconfirmedUser_factory do
    %User{
      email: sequence(:email, &"email-#{&1}@example.com"),
      password_hash: "pa$$word ha$h",
      confirmation_token: "CoNfIrMaTiOnToKeN"
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
      app_key: "my public key",
      app_eui: "randomappeui",
      dev_eui: "randomeui",
      oui: "0"
    }
  end

  def gateway_factory do
    %Gateway{
      name: "My Gateway",
      mac: sequence(:mac, &"mac address #{&1}"),
      public_key: "my public key",
      latitude: 37.770918,
      longitude: -122.419487,
      status: "pending"
    }
  end

  def event_factory do
    %Event{
      description: "I am an event",
      payload: "some payload",
      payload_size: 42,
      reported_at_naive: "2010-04-17T14:00:00.000000Z",
      rssi: 120.5,
      snr: 42,
      status: "some status"
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
