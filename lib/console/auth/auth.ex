defmodule Console.Auth do
  @moduledoc """
  The Auth context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Auth.User

  def get_user_by_id(id) do
    Repo.get(User, id)
  end

  def get_user_by_email(email) do
    Repo.get_by(User, email: email)
  end

  def get_user_by_id_and_email(user_id, email) do
    user = get_user_by_email(email)
    vetted = if is_nil(user) do nil else user.vetted end

    case get_user_by_id(user_id) do
      %{super: is_super} ->
        vetted = if is_super == true do true else vetted end
        get_user_data_map(user_id, email, vetted, is_super)
      _ -> get_user_data_map(user_id, email, vetted)
    end
  end

  defp get_user_data_map(user_id, user_email, vetted, super_user \\ false) do
    %User{id: user_id, super: super_user, email: user_email, vetted: vetted}
  end
end
