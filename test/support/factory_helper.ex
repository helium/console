defmodule Console.FactoryHelper do
  use Phoenix.ConnTest
  import Console.Factory
  import ConsoleWeb.Guardian

  alias Console.Organizations

  def authenticate_user(%{conn: conn}) do
    user = params_for(:user)
    {:ok, organization} = Organizations.create_organization(user, params_for(:organization))
    conn = conn
           |> put_req_header("accept", "application/json")
           |> put_req_header("authorization", user.id <> " " <> user.email)
           |> put_req_header("organization", organization.id)
    {:ok, conn: conn}
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

  def create_device_for_organization(organization, attrs \\ %{}) do
    attrs = Map.merge(attrs, %{organization_id: organization.id})
    attrs = for {key, val} <- params_for(:device, attrs), into: %{}, do: {Atom.to_string(key), val}
    {:ok, device} = Console.Devices.create_device(attrs, organization)
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
