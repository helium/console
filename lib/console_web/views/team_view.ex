defmodule ConsoleWeb.TeamView do
  use ConsoleWeb, :view
  alias ConsoleWeb.TeamView
  alias ConsoleWeb.MembershipView

  def render("index.json", %{teams: teams}) do
    render_many(teams, TeamView, "team.json")
  end

  def render("show.json", %{team: team}) do
    render_one(team, TeamView, "team.json")
  end

  def render("switch.json", %{jwt: jwt}) do
    %{
      jwt: jwt
    }
  end

  def render("team.json", %{team: team}) do
    %{
      id: team.id,
      name: team.name
    }
    |> MembershipView.append_memberships(team.memberships)
  end

  def append_team(json, team) do
    Map.put(json, :team, render_one(team, TeamView, "team.json"))
  end
end
