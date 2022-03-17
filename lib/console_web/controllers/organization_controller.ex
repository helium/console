defmodule ConsoleWeb.OrganizationController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Organizations.Organization
  alias Console.Organizations
  alias Console.Devices
  alias Console.DcPurchases
  alias Console.Email
  alias Console.Mailer
  alias Console.Helpers
  alias Console.AuditActions

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
          initial_dc = String.to_integer(System.get_env("INITIAL_ORG_GIFTED_DC") || "10000")
          if initial_dc > 0 do
            Organizations.update_organization(organization, %{ "dc_balance" => initial_dc, "dc_balance_nonce" => 1, "received_free_dc" => true })
          end

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

  def update(conn, %{"id" => id, "active" => active} = attrs) do
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

      AuditActions.create_audit_action(
        organization.id,
        conn.assigns.current_user.email,
        "org_controller_update",
        organization.id,
        attrs
      )

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

  def update(conn, %{"id" => id, "name" => name} = attrs) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id)
    membership = Organizations.get_membership!(conn.assigns.current_user, organization)

    cond do
      membership.role != "admin" ->
        {:error, :forbidden, "You don't have access to do this"}
      organization.name == name ->
        {:error, :bad_request, "The new organization's name must be different than the current name"}
      name == "" or String.length(name) < 3 ->
        {:error, :bad_request, "The organization name must be at least 3 characters"}
      true ->
        with {:ok, %Organization{} = organization} <- Organizations.update_organization(organization, %{ "name" => name }) do
            ConsoleWeb.Endpoint.broadcast("graphql:topbar_orgs", "graphql:topbar_orgs:#{conn.assigns.current_user.id}:organization_list_update", %{})
            ConsoleWeb.Endpoint.broadcast("graphql:topbar_orgs", "graphql:topbar_orgs:#{organization.id}:current_organization_renamed", %{})
            ConsoleWeb.Endpoint.broadcast("graphql:orgs_index_table", "graphql:orgs_index_table:#{conn.assigns.current_user.id}:organization_list_update", %{})

            AuditActions.create_audit_action(
              organization.id,
              conn.assigns.current_user.email,
              "org_controller_update",
              organization.id,
              attrs
            )

            membership_info = %{id: organization.id, name: organization.name, role: membership.role}
            conn
            |> put_status(:ok)
            |> put_resp_header("message",  "Organization renamed successfully")
            |> render("show.json", organization: membership_info)
        end
    end
  end

  def delete(conn, %{"id" => id, "destination_org_id" => destination_org_id} = attrs) do
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

          dc_purchase_attrs = %{
            "dc_purchased" => balance_to_transfer,
            "cost" => 0,
            "card_type" => "transfer",
            "last_4" => "transfer",
            "user_id" => conn.assigns.current_user.id,
            "from_organization" => organization.name,
            "organization_id" => destination_org.id
          }

          {:ok, _destination_org_dc_purchase} = DcPurchases.create_dc_purchase(dc_purchase_attrs)
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

          AuditActions.create_audit_action(
            organization.id,
            conn.assigns.current_user.email,
            "org_controller_delete",
            organization.id,
            attrs
          )

          render_org = %{id: organization.id, name: organization.name, role: membership.role}
          conn
          |> put_status(:accepted)
          |> put_resp_header("message",  "#{organization.name} deleted successfully")
          |> render("show.json", organization: render_org)
        end
    end
  end

  def import(conn, attrs) do
    try do
      result =
        Ecto.Multi.new()
        |> Ecto.Multi.run(:organization, fn _repo, _ ->
          organization =
            %Console.Organizations.Organization{}
            |> Ecto.Changeset.cast(attrs["organization"], [:id, :name, :flow])
            |> Console.Organizations.Organization.put_webhook_key()
            |> Console.Organizations.Organization.put_default_app_eui()
            |> Console.Repo.insert!()

          {:ok, organization}
        end)
        |> Ecto.Multi.run(:alerts, fn _repo, _ ->
          Enum.each(attrs["alerts"], fn alert ->
            %Console.Alerts.Alert{}
            |> Ecto.Changeset.cast(alert, [:id, :name, :node_type, :config, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:multi_buys, fn _repo, _ ->
          Enum.each(attrs["multi_buys"], fn mb ->
            %Console.MultiBuys.MultiBuy{}
            |> Ecto.Changeset.cast(mb, [:id, :name, :value, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:config_profiles, fn _repo, _ ->
          Enum.each(attrs["config_profiles"], fn cp ->
            %Console.ConfigProfiles.ConfigProfile{}
            |> Ecto.Changeset.cast(cp, [:id, :name, :adr_allowed, :cf_list_enabled, :rx_delay, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:devices, fn _repo, _ ->
          Enum.each(attrs["devices"], fn device ->
            %Console.Devices.Device{}
            |> Ecto.Changeset.cast(device, [:id, :name, :oui, :dev_eui, :app_eui, :app_key, :multi_buy_id, :config_profile_id, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:functions, fn _repo, _ ->
          Enum.each(attrs["functions"], fn function ->
            %Console.Functions.Function{}
            |> Ecto.Changeset.cast(function, [:id, :name, :body, :type, :format, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:channels, fn _repo, _ ->
          Enum.each(attrs["channels"], fn channel ->
            %Console.Channels.Channel{}
            |> Ecto.Changeset.cast(channel, [:id, :name, :type, :type_name, :payload_template, :receive_joins, :credentials, :organization_id])
            |> Console.Channels.Channel.put_downlink_token()
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:labels, fn _repo, _ ->
          Enum.each(attrs["labels"], fn label ->
            %Console.Labels.Label{}
            |> Ecto.Changeset.cast(label, [:id, :name, :creator, :multi_buy_id, :config_profile_id, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:groups, fn _repo, _ ->
          Enum.each(attrs["groups"], fn group ->
            %Console.Groups.Group{}
            |> Ecto.Changeset.cast(group, [:id, :name, :organization_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:alert_nodes, fn _repo, _ ->
          Enum.each(attrs["alert_nodes"], fn node ->
            %Console.Alerts.AlertNode{}
            |> Ecto.Changeset.cast(node, [:id, :alert_id, :node_id, :node_type])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:devices_labels, fn _repo, _ ->
          Enum.each(attrs["devices_labels"], fn dl ->
            %Console.Labels.DevicesLabels{}
            |> Ecto.Changeset.cast(dl, [:id, :device_id, :label_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:flows, fn _repo, _ ->
          Enum.each(attrs["flows"], fn flow ->
            %Console.Flows.Flow{}
            |> Ecto.Changeset.cast(flow, [:id, :organization_id, :device_id, :label_id, :function_id, :channel_id])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:organization_hotspots, fn _repo, _ ->
          Enum.each(attrs["organization_hotspots"], fn oh ->
            %Console.OrganizationHotspots.OrganizationHotspot{}
            |> Ecto.Changeset.cast(oh, [:id, :hotspot_address, :organization_id, :claimed, :alias])
            |> Console.Repo.insert!()
          end)

          {:ok, "success"}
        end)
        |> Ecto.Multi.run(:membership, fn _repo, %{ organization: organization } ->
          %Console.Organizations.Membership{}
          |> Ecto.Changeset.cast(
            %{
              "role" => "admin",
              "user_id" => conn.assigns.current_user.id,
              "email" => conn.assigns.current_user.email,
              "organization_id" => organization.id
            },
            [:role, :user_id, :organization_id, :email]
          )
          |> Console.Repo.insert!()

          {:ok, "success"}
        end)
        |> Console.Repo.transaction()

      with {:ok, _} <- result do
        conn
        |> send_resp(:ok, "Import successful")
      end
    rescue
      error ->
        case error do
          %Ecto.ConstraintError{ constraint: constraint } ->
            Appsignal.send_error(error, "Failed to import organization", __STACKTRACE__)
            {:error, :unprocessable_entity, "Could not import due to violation of constraint #{constraint}"}
          _ ->
            Appsignal.send_error(error, "Failed to import organization", __STACKTRACE__)
            error
        end
    end
  end

  def export(conn, _) do
    organization_id = conn.assigns.current_organization.id
    organization =
      Organizations.get_organization!(organization_id)
      |> Map.take([:id, :name, :flow])
    alerts =
      Console.Alerts.get_all_organization_alerts(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :node_type, :config, :organization_id])))
    multi_buys =
      Console.MultiBuys.get_all_organization_multi_buys(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :value, :organization_id])))
    config_profiles =
      Console.ConfigProfiles.get_all_organization_config_profiles(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :adr_allowed, :cf_list_enabled, :rx_delay, :organization_id])))
    devices =
      Console.Devices.get_devices(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :oui, :dev_eui, :app_eui, :app_key, :multi_buy_id, :config_profile_id, :organization_id])))
    functions = Console.Functions.get_all_organization_functions(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :body, :type, :format, :organization_id])))
    channels = Console.Channels.get_all_organization_channels(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :type, :type_name, :payload_template, :receive_joins, :credentials, :organization_id])))
    labels = Console.Labels.get_all_organization_labels(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :creator, :multi_buy_id, :config_profile_id, :organization_id])))
    groups = Console.Groups.get_all_organization_groups(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :name, :organization_id])))
    alert_nodes =
      alerts
      |> Enum.map(&(&1.id))
      |> Console.Alerts.get_all_organization_alert_nodes()
      |> Enum.map(&(Map.take(&1, [:id, :alert_id, :node_id, :node_type])))
    devices_labels =
      labels
      |> Enum.map(&(&1.id))
      |> Console.Labels.get_all_organization_devices_labels()
      |> Enum.map(&(Map.take(&1, [:id, :device_id, :label_id])))
    flows =
      Console.Flows.get_flows(organization_id)
      |> Enum.map(&(Map.take(&1, [:id, :organization_id, :device_id, :label_id, :function_id, :channel_id])))
    organization_hotspots =
      Console.OrganizationHotspots.all(organization)
      |> Enum.map(&(Map.take(&1, [:id, :hotspot_address, :organization_id, :claimed, :alias])))

    result = %{
      organization: organization,
      alerts: alerts,
      multi_buys: multi_buys,
      config_profiles: config_profiles,
      devices: devices,
      functions: functions,
      channels: channels,
      labels: labels,
      groups: groups,
      alert_nodes: alert_nodes,
      devices_labels: devices_labels,
      flows: flows,
      organization_hotspots: organization_hotspots
    }

    conn
    |> send_resp(:ok, Jason.encode!(result))
  end

  def submitted_survey(conn, _) do
    organization = conn.assigns.current_organization

    if Application.get_env(:console, :self_hosted) == nil && organization.survey_token == nil do
      # if not yet 30 days since org insert
      org_attrs = %{
        "survey_token_inserted_at" => NaiveDateTime.utc_now(),
        "survey_token_used" => false,
        "survey_token" => Helpers.generate_token(8)
      }
      with {:ok, _} <- Organizations.update_organization(organization, org_attrs) do
        ConsoleWeb.Endpoint.broadcast("graphql:topbar_orgs", "graphql:topbar_orgs:#{organization.id}:survey_submitted", %{})
        ConsoleWeb.Endpoint.broadcast("graphql:mobile_topbar_orgs", "graphql:mobile_topbar_orgs:#{organization.id}:survey_submitted", %{})

        AuditActions.create_audit_action(
          organization.id,
          conn.assigns.current_user.email,
          "org_controller_submitted_survey",
          nil,
          nil
        )

        conn
        |> send_resp(:no_content, "")
      end
    else
      {:error, :bad_request, "Cannot create a new survey token, please refresh the page"}
    end
  end

  def submit_survey_token(conn, %{ "token" => token }) do
    organization = conn.assigns.current_organization

    if Application.get_env(:console, :self_hosted) == nil && organization.survey_token == token && !organization.survey_token_used do
      org_attrs = %{
        "survey_token_used" => true,
        "dc_balance" => organization.dc_balance + 9750,
        "dc_balance_nonce" => organization.dc_balance_nonce + 1
      }
      with {:ok, _} <- Organizations.update_organization(organization, org_attrs) do
        ConsoleWeb.Endpoint.broadcast("graphql:dc_index", "graphql:dc_index:#{organization.id}:update_dc", %{})

        AuditActions.create_audit_action(
          organization.id,
          conn.assigns.current_user.email,
          "org_controller_submit_survey_token",
          nil,
          nil
        )

        conn
        |> send_resp(:no_content, "")
      end
    else
      {:error, :bad_request, "Invalid token entered, please try again"}
    end
  end

  def resend_survey_token(conn, _) do
    organization = conn.assigns.current_organization

    if organization.survey_token_sent_at != nil do
      admins = Organizations.get_administrators(organization)

      Enum.each(admins, fn administrator ->
        Email.survey_token_email(administrator, %{ token: organization.survey_token }) |> Mailer.deliver_later()
      end)

      conn
      |> send_resp(:no_content, "")
    end
  end
end
