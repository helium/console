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
  alias Console.Gateways.Gateway
  alias Console.Channels.Channel
  alias Console.Teams
  alias Console.Teams.Team

  def insert_device(index, %Team{} = team) do
    Repo.insert! %Device{
      name: "Device #{index}",
      mac: random_mac(),
      public_key: :crypto.strong_rand_bytes(64),
      team_id: team.id
    }
  end

  def insert_gateway(index, %Team{} = team) do
    Repo.insert! %Gateway{
      name: "Gateway #{index}",
      mac: random_mac(),
      public_key: :crypto.strong_rand_bytes(64),
      latitude: 37.770918,
      longitude: -122.419487,
      team_id: team.id
    }
  end

  def insert_channel(index, %Team{} = team) do
    Repo.insert! %Channel{
      name: "Channel #{index}",
      type: Enum.random(~w(azure google http mqtt)),
      credentials: %{some_api_key: random_hex_bytes(64)},
      team_id: team.id
    }
  end

  def maybe_generate_seeds_for_all_teams do
    Enum.each(Teams.list_teams, &maybe_generate_seeds(&1))
  end

  def maybe_generate_seeds(%Team{} = team) do
    team = Teams.fetch_assoc(team)

    if length(team.devices) == 0 do
      (1..10) |> Enum.each(fn i -> insert_device(i, team) end)
    end

    if length(team.gateways) == 0 do
      (1..10) |> Enum.each(fn i -> insert_gateway(i, team) end)
    end

    if length(team.channels) == 0 do
      (1..10) |> Enum.each(fn i -> insert_channel(i, team) end)
    end
  end

  def clear do
    Repo.delete_all(Device)
    Repo.delete_all(Gateway)
    Repo.delete_all(Channel)
  end

  defp random_mac do
    random_hex_bytes(8)
  end

  defp random_hex_bytes(num \\ 8) do
    :crypto.strong_rand_bytes(num) |> Base.encode16
  end
end

# Console.DatabaseSeeder.clear()
Console.DatabaseSeeder.maybe_generate_seeds_for_all_teams()
