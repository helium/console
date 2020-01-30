defmodule Console.FactoryHelper do
  use Phoenix.ConnTest
  import Console.Factory
  import ConsoleWeb.Guardian

  def authenticate_user(%{conn: conn}) do
    {:ok, user, organization} = Console.Auth.create_user(params_for(:user, %{password: "password"}), %{name: "Test Organization"})
    token = Console.Auth.generate_session_token(user, organization)
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", "bearer: " <> token)
    {:ok, conn: conn, user: user, organization: organization}
  end

  def unauthenticated_user(%{conn: conn}) do
    {:ok, user, _} = Console.Auth.create_user(params_for(:user, %{password: "password"}), %{name: "Test Organization"})
    {:ok, conn: conn, user: user}
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

  def create_device_for_organization(organization, attrs \\ %{}) do
    attrs = Map.merge(attrs, %{organization_id: organization.id})
    attrs = for {key, val} <- params_for(:device, attrs), into: %{}, do: {Atom.to_string(key), val}
    {:ok, device} = Console.Devices.create_device(attrs)
    device
  end

  def create_gateway_for_organization(organization, attrs \\ %{}) do
    attrs = Map.merge(attrs, %{organization_id: organization.id})
    attrs = params_for(:gateway, attrs)
    {:ok, gateway} = Console.Gateways.create_gateway(attrs)
    gateway
  end

  def create_channel_for_organization(organization, attrs \\ %{}) do
    attrs = Map.merge(attrs, %{organization_id: organization.id})
    attrs = for {key, val} <- params_for(:channel, attrs), into: %{}, do: {Atom.to_string(key), val}
    {:ok, channel} = Console.Channels.create_channel(organization, attrs)
    channel
  end
end
