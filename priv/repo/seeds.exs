# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Console.Repo.insert!(%Console.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
#

defmodule Console.DatabaseSeeder do
  alias Console.Repo
  alias Console.Devices.Device

  def insert_device(index) do
    Repo.insert! %Device{
      name: "Device #{index}",
      mac: random_mac(),
      public_key: :crypto.strong_rand_bytes(64)
    }
  end

  def clear do
    Repo.delete_all()
  end

  defp random_mac do
    :crypto.strong_rand_bytes(8) |> Base.encode16
  end
end

(1..10) |> Enum.each(fn i -> Console.DatabaseSeeder.insert_device(i) end)
