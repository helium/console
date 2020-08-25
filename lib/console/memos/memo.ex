defmodule Console.Memos.Memo do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "memos" do
    field :memo, :string

    belongs_to :organization, Organization

    timestamps()
  end

  @doc false
  def changeset(memo, attrs) do
    memo
    |> cast(attrs, [:memo])
    |> unique_constraint(:memo, memo: :memos_memo_index, message: "This memo already exists")
  end

  @doc false
  def create_changeset(memo, attrs) do
    memo
    |> changeset(attrs)
  end
end
