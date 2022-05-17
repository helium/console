defmodule Console.Repo.Migrations.AddKeysToDevice do
  use Ecto.Migration

  def up do
    alter table(:devices) do
      add :ecc_key_pair, :bytea
    end

    flush()

    %{ rows: rows } = Ecto.Adapters.SQL.query!(
      Console.Repo,
      "SELECT id, name FROM devices"
    )

    Enum.each(rows, fn row ->
      keys = :libp2p_crypto.generate_keys(:ecc_compact)
      binary = :libp2p_crypto.keys_to_bin(keys)
      Ecto.Adapters.SQL.query!(
        Console.Repo,
        "UPDATE devices SET ecc_key_pair = $2 WHERE id = $1",
        [Enum.at(row, 0), binary]
      )
    end)

    alter table(:devices) do
      modify :ecc_key_pair, :bytea, null: false
    end
  end

  def down do
    alter table(:devices) do
      remove :ecc_key_pair
    end
  end
end
