defmodule Console.Repo.Migrations.SetAllDevicesInXORFilterTrue do
  use Ecto.Migration

  def up do
    Ecto.Adapters.SQL.query!(Console.Repo, """
      UPDATE devices SET in_xor_filter = true;
    """)
  end

  def down do
    Ecto.Adapters.SQL.query!(Console.Repo, """
      UPDATE devices SET in_xor_filter = false;
    """)
  end
end
