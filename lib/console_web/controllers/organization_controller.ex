defmodule ConsoleWeb.OrganizationController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Organizations.Organization
  alias Console.Organizations
  alias Console.Devices
  alias Console.DcPurchases
  alias Console.Email
  alias Console.Mailer

  plug ConsoleWeb.Plug.AuthorizeAction when action in [:delete]

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _) do
    organizations =
      if conn.assigns.current_user.super do
        Organizations.list_organizations()
      else
        last_viewed_membership = Organizations.get_last_viewed_org_membership(conn.assigns.current_user) |> List.first()
        if last_viewed_membership != nil do
          user_orgs = Organizations.get_organizations(conn.assigns.current_user)
          Enum.filter(user_orgs, fn x -> x.id == last_viewed_membership.organization_id end) ++ Enum.filter(user_orgs, fn x -> x.id != last_viewed_membership.organization_id end)
        else
          Organizations.get_organizations(conn.assigns.current_user)
        end
      end

    conn
    |> put_status(:ok)
    |> render("index.json", organizations: organizations)
  end

  def create(conn, %{"organization" => %{ "name" => organization_name } }) do
    with {:ok, %Organization{} = organization} <-
      Organizations.create_organization(conn.assigns.current_user, %{ "name" => organization_name }) do
      organizations = Organizations.get_organizations(conn.assigns.current_user)
      membership = Organizations.get_membership!(conn.assigns.current_user, organization)
      membership_info = %{id: organization.id, name: organization.name, role: membership.role}
      case Enum.count(organizations) do
        1 ->
          Organizations.update_organization(organization, %{ "dc_balance" => System.get_env("INITIAL_DC_BALANCE") || 10000, "dc_balance_nonce" => 1, "received_free_dc" => true })

          render(conn, "show.json", organization: membership_info)
        _ ->
          ConsoleWeb.Endpoint.broadcast("graphql:topbar_orgs", "graphql:topbar_orgs:#{conn.assigns.current_user.id}:organization_list_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:orgs_index_table", "graphql:orgs_index_table:#{conn.assigns.current_user.id}:organization_list_update", %{})

          conn
          |> put_status(:created)
          |> put_resp_header("message",  "Organization #{organization.name} added successfully")
          |> render("show.json", organization: membership_info)
      end
    end
  end

  def update(conn, %{"id" => id, "active" => active}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id) |> Organizations.fetch_assoc([:devices])
    membership = Organizations.get_membership!(conn.assigns.current_user, organization)
    device_ids = organization.devices |> Enum.map(fn d -> d.id end)

    if membership.role != "admin" do
      {:error, :forbidden, "You don't have access to do this"}
    else
      org_changeset =
        organization
        |> Organization.update_changeset(%{ "active" => active })

      Ecto.Multi.new()
      |> Ecto.Multi.update(:organization, org_changeset)
      |> Ecto.Multi.run(:devices, fn _repo, _ ->
        with {count, nil} <- Devices.update_devices_active(device_ids, active, organization) do
          {:ok, count}
        end
      end)
      |> Repo.transaction()

      ConsoleWeb.Endpoint.broadcast("graphql:topbar_orgs", "graphql:topbar_orgs:#{conn.assigns.current_user.id}:organization_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:orgs_index_table", "graphql:orgs_index_table:#{conn.assigns.current_user.id}:organization_list_update", %{})
      if active do
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:active:devices", %{ "devices" => device_ids })
      else
        ConsoleWeb.Endpoint.broadcast("device:all", "device:all:inactive:devices", %{ "devices" => device_ids })
      end

      render_org = %{id: organization.id, name: organization.name, role: membership.role}
      conn
      |> put_resp_header("message", "Organization #{organization.name} updated successfully")
      |> render("show.json", organization: render_org)
    end
  end

  def update(conn, %{"switch_org_id" => org_id}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, org_id)
    membership = Organizations.get_membership!(conn.assigns.current_user, organization)

    with {:ok, _} <- Organizations.update_membership(membership, %{ updated_at: NaiveDateTime.utc_now() }) do
      conn
      |> send_resp(:no_content, "")
    end
  end

  def delete(conn, %{"id" => id, "destination_org_id" => destination_org_id}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id)
    membership = Organizations.get_membership!(conn.assigns.current_user, organization)
    balance_left = organization.dc_balance

    cond do
      membership.role != "admin" ->
        {:error, :forbidden, "You don't have access to do this"}
      organization.received_free_dc and balance_left < 10001 and destination_org_id != "no-transfer" ->
        {:error, :forbidden, "You cannot transfer the original gifted 10,000 DC to other organizations"}
      true ->
        destination_org =
          case destination_org_id do
            "no-transfer" -> nil
            _ -> Organizations.get_organization(conn.assigns.current_user, destination_org_id)
          end

        if balance_left != nil and balance_left > 0 and destination_org != nil do
          balance_to_transfer =
            if organization.received_free_dc do
              balance_left - 10000
            else
              balance_left
            end

          {:ok, {:ok, from_org_updated, to_org_updated }} = Organizations.send_dc_to_org(balance_to_transfer, organization, destination_org)
          ConsoleWeb.Endpoint.broadcast("graphql:dc_index", "graphql:dc_index:#{from_org_updated.id}:update_dc", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:dc_index", "graphql:dc_index:#{to_org_updated.id}:update_dc", %{})
          ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(from_org_updated)
          ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(to_org_updated)

          attrs = %{
            "dc_purchased" => balance_to_transfer,
            "cost" => 0,
            "card_type" => "transfer",
            "last_4" => "transfer",
            "user_id" => conn.assigns.current_user.id,
            "from_organization" => organization.name,
            "organization_id" => destination_org.id
          }

          {:ok, _destination_org_dc_purchase} = DcPurchases.create_dc_purchase(attrs)
          ConsoleWeb.Endpoint.broadcast("graphql:dc_purchases_table", "graphql:dc_purchases_table:#{destination_org.id}:update_dc_table", %{})
        end

        admins = Organizations.get_administrators(organization)

        with {:ok, _} <- Organizations.delete_organization(organization) do
          Enum.each(admins, fn administrator ->
            Email.delete_org_notification_email(organization, administrator.email, membership.email)
            |> Mailer.deliver_later()
          end)

          ConsoleWeb.Endpoint.broadcast("graphql:topbar_orgs", "graphql:topbar_orgs:#{conn.assigns.current_user.id}:organization_list_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:orgs_index_table", "graphql:orgs_index_table:#{conn.assigns.current_user.id}:organization_list_update", %{})

          render_org = %{id: organization.id, name: organization.name, role: membership.role}
          conn
          |> put_status(:accepted)
          |> put_resp_header("message",  "#{organization.name} deleted successfully")
          |> render("show.json", organization: render_org)
        end
    end
  end
end
