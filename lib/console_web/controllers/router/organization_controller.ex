defmodule ConsoleWeb.Router.OrganizationController do
  use ConsoleWeb, :controller

  alias Console.Organizations
  alias Console.Memos
  alias Console.Memos.Memo
  alias Console.DcPurchases
  alias Console.DcPurchases.DcPurchase
  alias ConsoleWeb.Router.OrganizationView

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, params) do
    organizations = Organizations.paginate_all(params["after"])
    parsed_orgs = OrganizationView.render("index.json", organizations: organizations)

    last_org = List.last(parsed_orgs)
    response =
      case last_org do
        nil ->
          %{
            data: parsed_orgs
          }
        _ ->
          %{
            data: parsed_orgs,
            after: last_org.id
          }
      end

    conn
    |> send_resp(:ok, Poison.encode!(response))
  end

  def show(conn, %{"id" => id}) do
    organization = Organizations.get_organization!(id)

    render(conn, "show.json", organization: organization)
  end

  def burned_dc(conn, %{"memo" => memo_number, "dc_amount" => amount, "hnt_amount" => cost}) do
    memo_txt = memo_number |> :binary.encode_unsigned(:little) |> :base64.encode()

    case Memos.get_memo(memo_txt) do
      %Memo{} = memo ->
        attrs = %{
          "dc_purchased" => amount,
          "cost" => cost,
          "card_type" => "burn",
          "last_4" => "burn",
          "user_id" => "HNT Burn",
          "organization_id" => memo.organization_id,
          "payment_id" => memo.memo,
        }

        case DcPurchases.get_by_payment_id(memo.memo) do
          nil ->
            organization = Organizations.get_organization!(memo.organization_id)
            with {:ok, %DcPurchase{} = _dc_purchase } <- DcPurchases.create_dc_purchase_update_org(attrs, organization) do
              Organizations.update_organization(organization, %{ "received_free_dc" => false })

              ConsoleWeb.Endpoint.broadcast("graphql:dc_index", "graphql:dc_index:#{organization.id}:update_dc", %{})
              ConsoleWeb.Endpoint.broadcast("graphql:dc_purchases_table", "graphql:dc_purchases_table:#{organization.id}:update_dc_table", %{})
              ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(organization)

              conn |> send_resp(:no_content, "")
            end
          _ ->
            conn |> send_resp(:no_content, "")
        end

      nil ->
        {:error, :not_found, "An organization with that memo was not found"}
    end
  end

  def manual_update_router_dc(conn, %{"organization_id" => organization_id, "amount" => amount}) do
    organization = Organizations.get_organization!(organization_id)

    attrs = %{ dc_balance: amount, dc_balance_nonce: organization.dc_balance_nonce + 1 }

    with {:ok, organization} <- Organizations.update_organization(organization, attrs) do
      ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(organization)
      conn |> send_resp(:no_content, "")
    end
  end

  def import(conn, attrs) do
    result =
      Ecto.Multi.new()
      |> Ecto.Multi.run(:organization, fn _repo, _ ->
        %Console.Organizations.Organization{}
        |> Ecto.Changeset.cast(attrs["organization"], [:id, :name, :flow])
        |> Console.Organizations.Organization.put_webhook_key()
        |> Console.Organizations.Organization.put_default_app_eui()
        |> Console.Repo.insert!()

        {:ok, "success"}
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
      |> Console.Repo.transaction()

    with {:ok, _} <- result do
      conn
      |> send_resp(:ok, "Import successful")
    end
  end

  def export(conn, %{"organization_id" => organization_id}) do
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
end
