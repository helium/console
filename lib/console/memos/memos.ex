defmodule Console.Memos do
  import Ecto.Query, warn: false
  alias Ecto.UUID
  alias Console.Repo

  alias Console.Memos.Memo

  def create_memo(attrs = %{}) do
    %Memo{}
    |> Memo.create_changeset(attrs)
    |> Repo.insert()
  end
end
