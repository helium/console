defmodule Console.Factory do
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Auth.User
  alias Console.Channels.Channel
  alias Console.Devices.Device
  alias Console.Events.Event

  def user_factory do
    %User{
      email: sequence(:email, &"email-#{&1}@example.com"),
      password_hash: "pa$$word ha$h",
      confirmed_at: DateTime.utc_now()
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
      type: "azure"
    }
  end

  def device_factory do
    %Device{
      name: "My Device",
      mac: "mac address",
      public_key: "my public key"
    }
  end

  def event_factory do
    %Event{
      description: "an event"
    }
  end
end
