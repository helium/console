defmodule Console.Factory do
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Auth.User
  alias Console.Channels.Channel

  def user_factory do
    %User{
      email: sequence(:email, &"email-#{&1}@example.com"),
      password_hash: "pa$$word ha$h",
      confirmed_at: DateTime.utc_now()
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
end
