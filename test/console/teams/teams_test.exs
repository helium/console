defmodule Console.TeamsTest do
  use Console.DataCase

  alias Console.Teams
  alias Console.Teams.Team

  import Console.Factory


  describe "teams" do
    test "create_team/2 with valid data creates a team" do
      user = insert(:user)
      attrs = params_for(:team)
      assert {:ok, %Team{} = team} = Teams.create_team(user, attrs)
      assert team.name == attrs.name

      team = Teams.fetch_assoc(team)
      assert List.first(team.users).id == user.id
    end

    test "create_user/2 with invalid data returns error changeset" do
      # assert {:error, %Ecto.Changeset{}} = Auth.create_user(@invalid_attrs)
    end
  end
end
