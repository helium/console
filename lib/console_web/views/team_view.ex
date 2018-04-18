defmodule ConsoleWeb.TeamView do
  use ConsoleWeb, :view
  alias ConsoleWeb.TeamView
  alias ConsoleWeb.MembershipView
  alias ConsoleWeb.InvitationView

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
    |> InvitationView.append_invitations(team.invitations)
  end

  def append_team(json, team) do
    Map.put(json, :team, render_one(team, TeamView, "team.json"))
  end
end
