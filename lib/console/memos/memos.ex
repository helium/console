defmodule Console.Memos do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Memos.Memo

  def create_memo(attrs = %{}) do
    %Memo{}
    |> Memo.create_changeset(attrs)
    |> Repo.insert()
  end

  def get_memo(memo) do
     Repo.get_by(Memo, [memo: memo])
  end

  def delete_old_memos(organization) do
    current_datetime = NaiveDateTime.utc_now()
    expired_datetime = NaiveDateTime.add(current_datetime, -1 * 60 * 60 * 24 * 14)
    organization_id = organization.id

    from(m in Memo, where: m.inserted_at < ^expired_datetime and m.organization_id == ^organization_id)
    |> Repo.delete_all()
  end
end
