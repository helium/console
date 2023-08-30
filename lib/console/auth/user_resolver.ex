defmodule Console.Users.UserResolver do
  alias Console.Auth

  def get_vetted_user_status(%{email: email}, %{context: %{current_organization: _}}) do
    user = Auth.get_user_by_email(email)
    if not is_nil(user) and (user.vetted == true or user.super == true) do
      {:ok, %{vetted: true}}
    else
      {:ok, %{vetted: false}}
    end
  end
end