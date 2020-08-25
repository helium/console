defmodule ConsoleWeb.Router.OrganizationController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query
  import ConsoleWeb.AuthErrorHandler

  alias Console.Organizations
  alias Console.Organizations.Organization
  alias Console.Memos
  alias Console.Memos.Memo
  alias Console.DcPurchases
  alias Console.DcPurchases.DcPurchase

  action_fallback(ConsoleWeb.FallbackController)

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
            with {:ok, %DcPurchase{} = dc_purchase } <- DcPurchases.create_dc_purchase_update_org(attrs, organization) do
              ConsoleWeb.DataCreditController.broadcast(organization, dc_purchase)
              ConsoleWeb.DataCreditController.broadcast(organization)
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
end
