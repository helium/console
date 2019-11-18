defmodule ConsoleWeb.StatsController do
  use ConsoleWeb, :controller
  alias Console.Devices
  alias Console.Teams.Organizations
  alias Console.Teams
  alias Console.Auth

  def show(conn, _params) do
    devices = Devices.list_devices() |> Enum.count
    organizations = Organizations.list_organizations() |> Enum.count
    teams = Teams.list_teams() |> Enum.count
    users = Auth.list_users() |> Enum.count

    conn
      |> render("show.json", stats: %{ devices: devices, organizations: organizations, teams: teams, users: users })
  end
end
