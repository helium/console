defmodule Console.FactoryHelper do
  use Phoenix.ConnTest
  import Console.Factory
  import ConsoleWeb.Guardian

  def authenticate_user(%{conn: conn}) do
    user = insert(:user)
    {:ok, team} = Console.Teams.create_team(user, %{name: "Test Team"})
    token = Console.Auth.generate_session_token(user, team)
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", "bearer: " <> token)
    {:ok, conn: conn, user: user, team: team}
  end

  def authenticated_conn() do
    user = insert(:user)
    {:ok, token, _} = encode_and_sign(user, %{}, token_type: :access)
    build_conn()
    |> put_req_header("accept", "application/json")
    |> put_req_header("authorization", "bearer: " <> token)
  end

  def create_device_with_events(count) do
    device = insert(:device)
    events = insert_list(count, :event, device: device)
    {device, events}
  end

  def create_device_for_team(team, attrs \\ %{}) do
    attrs = attrs |> Enum.into(%{team_id: team.id})
    attrs = params_for(:device, attrs)
    {:ok, device} = Console.Devices.create_device(attrs)
    device
  end
end
