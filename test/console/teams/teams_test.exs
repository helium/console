defmodule Console.TeamsTest do
  use Console.DataCase

  alias Console.Teams
  alias Console.Devices
  alias Console.Teams.Team
  alias Console.Teams.Organizations
  alias Console.Teams.Invitation

  import Console.Factory


  describe "teams" do
    test "create_team/2 with valid data creates a team" do
      user = insert(:user)
      organization = insert(:organization)
      attrs = params_for(:team)
      assert {:ok, %Team{} = team} = Teams.create_team(user, attrs, organization)
      assert team.name == attrs.name

      organization = Organizations.fetch_assoc(organization)
      assert List.first(organization.teams).name == attrs.name
    end

    test "create_user/2 with invalid data returns error changeset" do
      user = insert(:user)
      organization = insert(:organization)
      assert {:error, %Ecto.Changeset{}} = Teams.create_team(user, %{}, organization)
      assert {:error, %Ecto.Changeset{}} = Teams.create_team(user, %{name: "s"}, organization)
    end

    test "delete_team/1 deletes the team and all related owned resources" do
      user = insert(:user)
      organization = insert(:organization)
      attrs = params_for(:team)
      assert {:ok, %Team{} = team} = Teams.create_team(user, attrs, organization)
      device_attrs = %{ "name" => "test", "mac" => "1", "team_id" => team.id }
      {:ok, _} = Devices.create_device(device_attrs)
      device_attrs = %{ "name" => "test", "mac" => "2", "team_id" => team.id }
      {:ok, _} = Devices.create_device(device_attrs)
      device_attrs = %{ "name" => "test", "mac" => "3", "team_id" => team.id }
      {:ok, _} = Devices.create_device(device_attrs)
      assert 3 == Devices.list_devices() |> Enum.count()
      Teams.delete_team(team)
      assert 0 == Devices.list_devices() |> Enum.count()
    end
  end
end
