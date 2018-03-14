defmodule Console.Factory do
  use ExMachina.Ecto, repo: Console.Repo

  alias Console.Auth.User

  def user_factory do
    %User{
      email: sequence(:email, &"email-#{&1}@example.com"),
      password: "pa$$word",
      confirmed_at: DateTime.utc_now()
    }
  end
end
