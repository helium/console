defmodule Console.GatewaysTest do
  use Console.DataCase

  alias Console.Gateways

  import Console.Factory

  describe "gateways" do
    alias Console.Gateways.Gateway

    @valid_attrs %{latitude: "120.5", longitude: "120.5", mac: "some mac", name: "some name", public_key: "some public_key", status: "pending"}
    @update_attrs %{latitude: "456.7", longitude: "456.7", mac: "some updated mac", name: "some updated name", public_key: "some updated public_key", status: "verified"}
    @invalid_attrs %{latitude: nil, longitude: nil, mac: nil, name: nil, public_key: nil}

    def gateway_fixture(attrs \\ %{}) do
      team = insert(:team)
      {:ok, gateway} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Enum.into(%{team_id: team.id})
        |> Gateways.create_gateway()

      gateway
    end

    test "list_gateways/0 returns all gateways" do
      gateway = gateway_fixture()
      assert Gateways.list_gateways() == [gateway]
    end

    test "get_gateway!/1 returns the gateway with given id" do
      gateway = gateway_fixture()
      assert Gateways.get_gateway!(gateway.id) == gateway
    end

    test "create_gateway/1 with valid data creates a gateway" do
      team = insert(:team)
      attrs = @valid_attrs |> Enum.into(%{team_id: team.id})
      assert {:ok, %Gateway{} = gateway} = Gateways.create_gateway(attrs)
      assert gateway.latitude == Decimal.new("120.5")
      assert gateway.longitude == Decimal.new("120.5")
      assert gateway.mac == "some mac"
      assert gateway.name == "some name"
      assert gateway.public_key == "some public_key"
    end

    test "create_gateway/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Gateways.create_gateway(@invalid_attrs)
    end

    test "update_gateway/2 with valid data updates the gateway" do
      gateway = gateway_fixture()
      assert {:ok, gateway} = Gateways.update_gateway(gateway, @update_attrs)
      assert %Gateway{} = gateway
      assert gateway.latitude == Decimal.new("456.7")
      assert gateway.longitude == Decimal.new("456.7")
      assert gateway.mac == "some updated mac"
      assert gateway.name == "some updated name"
      assert gateway.public_key == "some updated public_key"
    end

    test "update_gateway/2 with invalid data returns error changeset" do
      gateway = gateway_fixture()
      assert {:error, %Ecto.Changeset{}} = Gateways.update_gateway(gateway, @invalid_attrs)
      assert gateway == Gateways.get_gateway!(gateway.id)
    end

    test "delete_gateway/1 deletes the gateway" do
      gateway = gateway_fixture()
      assert {:ok, %Gateway{}} = Gateways.delete_gateway(gateway)
      assert_raise Ecto.NoResultsError, fn -> Gateways.get_gateway!(gateway.id) end
    end

    test "change_gateway/1 returns a gateway changeset" do
      gateway = gateway_fixture()
      assert %Ecto.Changeset{} = Gateways.change_gateway(gateway)
    end
  end
end
