defmodule ConsoleWeb.DataCreditController do
  use ConsoleWeb, :controller
  alias Console.Repo
  alias Console.Email
  alias Console.Organizations
  alias Console.DcPurchases
  alias Console.DcPurchases.DcPurchase
  alias Console.Organizations.Organization
  alias Console.Mailer

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  @stripe_api_url "https://api.stripe.com"
  @headers [
    {"Authorization", "Bearer #{Application.get_env(:console, :stripe_secret_key)}"},
    {"Content-Type", "application/x-www-form-urlencoded"}
  ]

  def create_customer_id_and_charge(conn, %{ "amountUSD" => amountUSD }) do
    { amount, _ } = Float.parse(amountUSD)
    if amount < 10 do
      {:error, :bad_request, "Credit card charges cannot be less than $10"}
    else
      current_organization = conn.assigns.current_organization

      request_body = URI.encode_query(%{
        "name" => current_organization.name,
        "description" => current_organization.id,
      })
      # create a customer id in stripe
      with {:ok, stripe_response} <- HTTPoison.post("#{@stripe_api_url}/v1/customers", request_body, @headers) do
         with 200 <- stripe_response.status_code do
           customer = Poison.decode!(stripe_response.body)
           with {:ok, %Organization{} = organization} <- Organizations.update_organization(current_organization, %{ "stripe_customer_id" => customer["id"]}) do
             # create a payment intent in stripe
             request_body = URI.encode_query(%{
               "customer" => organization.stripe_customer_id,
               "amount" => Float.round(amount * 100) |> trunc(),
               "currency" => "usd"
             })

             with {:ok, stripe_response} <- HTTPoison.post("#{@stripe_api_url}/v1/payment_intents", request_body, @headers) do
               with 200 <- stripe_response.status_code do
                 payment_intent = Poison.decode!(stripe_response.body)
                 conn |> send_resp(:ok, Poison.encode!(%{ payment_intent_secret: payment_intent["client_secret"] }))
               end
             end
           end
         end
      end
    end
  end

  def create_charge(conn, %{ "amountUSD" => amountUSD }) do
    { amount, _ } = Float.parse(amountUSD)

    if amount < 10 do
      {:error, :bad_request, "Credit card charges cannot be less than $10"}
    else
      current_organization = conn.assigns.current_organization
      request_body = URI.encode_query(%{
        "customer" => current_organization.stripe_customer_id,
        "amount" => Float.round(amount * 100) |> trunc(),
        "currency" => "usd"
      })

      with {:ok, stripe_response} <- HTTPoison.post("#{@stripe_api_url}/v1/payment_intents", request_body, @headers) do
        with 200 <- stripe_response.status_code do
          payment_intent = Poison.decode!(stripe_response.body)
          conn |> send_resp(:ok, Poison.encode!(%{ payment_intent_secret: payment_intent["client_secret"] }))
        end
      end
    end
  end

  def get_payment_methods(conn, _) do
    current_organization = conn.assigns.current_organization

    with {:ok, stripe_response} <- HTTPoison.get("#{@stripe_api_url}/v1/payment_methods?customer=#{current_organization.stripe_customer_id}&type=card", @headers) do
      with 200 <- stripe_response.status_code do
        conn |> send_resp(:ok, stripe_response.body)
      end
    end
  end

  def get_setup_payment_method(conn, _) do
    current_organization = conn.assigns.current_organization

    request_body = URI.encode_query(%{
      "customer" => current_organization.stripe_customer_id,
    })

    with {:ok, stripe_response} <- HTTPoison.post("#{@stripe_api_url}/v1/setup_intents", request_body, @headers) do
      with 200 <- stripe_response.status_code do
        setup_intent = Poison.decode!(stripe_response.body)
        # Send email about payment method added
        Organizations.get_administrators(current_organization)
        |> Enum.each(fn administrator ->
          conn.assigns.current_user
          |> Email.payment_method_updated_email(current_organization, administrator.email, "added") |> Mailer.deliver_later()
        end)
        conn |> send_resp(:ok, Poison.encode!(%{ setup_intent_secret: setup_intent["client_secret"] }))
      end
    end
  end

  def set_default_payment_method(conn, %{ "defaultPaymentId" => defaultPaymentId }) do
    current_organization = conn.assigns.current_organization

    with {:ok, %Organization{} = organization} <- Organizations.update_organization(current_organization, %{ "default_payment_id" => defaultPaymentId }) do
      broadcast(organization)
      # Send email about payment method changed
      Organizations.get_administrators(current_organization)
      |> Enum.each(fn administrator ->
        conn.assigns.current_user
        |> Email.payment_method_updated_email(current_organization, administrator.email, "updated") |> Mailer.deliver_later()
      end)
      conn
      |> put_resp_header("message", "Default payment method updated successfully")
      |> send_resp(:no_content, "")
    end
  end

  def remove_payment_method(conn, %{ "paymentId" => paymentId, "latestAddedCardId" => latestAddedCardId }) do
    current_organization = conn.assigns.current_organization

    request_body = URI.encode_query(%{})

    with {:ok, stripe_response} <- HTTPoison.post("#{@stripe_api_url}/v1/payment_methods/#{paymentId}/detach", request_body, @headers) do
      with 200 <- stripe_response.status_code do
        msg =
          if current_organization.automatic_payment_method == paymentId do
            attrs = %{
              "automatic_charge_amount" => nil,
              "automatic_payment_method" => nil
            }
            Organizations.update_organization(current_organization, attrs)

            "This payment method was used for Automatic Renewal, you will need to set up Automatic Renewals again with a new card."
          else
            "Payment method removed successfully"
          end

        if latestAddedCardId != nil do
          Organizations.update_organization(current_organization, %{ "default_payment_id" => latestAddedCardId })
        end
        # Send email about payment method changed
        Organizations.get_administrators(current_organization)
        |> Enum.each(fn administrator ->
          conn.assigns.current_user
          |> Email.payment_method_updated_email(current_organization, administrator.email, "removed") |> Mailer.deliver_later()
        end)

        broadcast(current_organization)

        conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
      end
    end
  end

  def create_dc_purchase(conn, %{"cost" => cost, "cardType" => card_type, "last4" => last_4, "paymentId" => stripe_payment_id}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    # Refactor out conversion rates between USD, DC, Bytes later
    attrs = %{
      "dc_purchased" => cost * 1000,
      "cost" => cost,
      "card_type" => card_type,
      "last_4" => last_4,
      "user_id" => current_user.id,
      "organization_id" => current_organization.id,
      "stripe_payment_id" => stripe_payment_id,
    }

    with nil <- DcPurchases.get_by_stripe_payment_id(stripe_payment_id),
      {:ok, stripe_response} <- HTTPoison.get("#{@stripe_api_url}/v1/payment_intents/#{stripe_payment_id}", @headers),
      200 <- stripe_response.status_code do
        payment_intent = Poison.decode!(stripe_response.body)

        with "succeeded" <- payment_intent["status"],
          {:ok, {:ok, %DcPurchase{} = dc_purchase }} <- DcPurchases.create_dc_purchase(attrs, current_organization) do
            current_organization = Organizations.get_organization!(current_organization.id)
            broadcast(current_organization, dc_purchase)
            broadcast(current_organization)
            broadcast_router_refill_dc_balance(current_organization)

            # send transaction emails
            Organizations.get_administrators(current_organization)
            |> Enum.each(fn admin ->
              Email.data_credit_purchase_email(dc_purchase, current_user, current_organization, admin.email) |> Mailer.deliver_later()
            end)

            conn
            |> put_resp_header("message", "Payment successful, your Data Credits balance has been refreshed.")
            |> send_resp(:no_content, "")
        end
    end
  end

  def set_automatic_payments(conn, %{ "chargeAmount" => charge_amount, "paymentMethod" => payment_method, "chargeOption" => charge_option }) do
    { amount, _ } = Float.parse(charge_amount)

    if amount < 10 and charge_option != "none" do
      {:error, :bad_request, "Credit card charges cannot be less than $10"}
    else
      current_organization = conn.assigns.current_organization

      attrs =
        case charge_option do
          "none" ->
            %{
              "automatic_charge_amount" => nil,
              "automatic_payment_method" => nil
            }
          _ ->
            %{
              "automatic_charge_amount" => Float.round(amount * 100) |> trunc(),
              "automatic_payment_method" => payment_method
            }
        end

      with {:ok, %Organization{} = organization} <- Organizations.update_organization(current_organization, attrs) do
        broadcast(organization)
        conn
        |> put_resp_header("message", "Automatic payments updated successfully")
        |> send_resp(:no_content, "")
      end
    end
  end

  def transfer_dc(conn, %{ "countDC" => countDC, "orgId" => toOrganizationId }) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user

    { amount, _ } = Float.parse(countDC)
    amount = amount |> trunc()

    cond do
      amount < 1 ->
        {:error, :bad_request, "Please select a higher Data Credit amount for transfer"}
      amount > current_organization.dc_balance ->
        {:error, :bad_request, "You do not have that many Data Credits to transfer"}
      true ->
        to_organization = Organizations.get_organization!(current_user, toOrganizationId)

        with {:ok, {:ok, from_org_updated, to_org_updated }} <- Organizations.send_dc_to_org(amount, current_organization, to_organization) do
          broadcast(from_org_updated)
          broadcast(to_org_updated)
          broadcast_router_refill_dc_balance(from_org_updated)
          broadcast_router_refill_dc_balance(to_org_updated)

          conn
          |> put_resp_header("message", "Transfer successful, please verify your new balance in both organizations")
          |> send_resp(:no_content, "")
        end
    end
  end

  def broadcast(%Organization{} = organization) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, organization, organization_updated: "#{organization.id}/organization_updated")
  end

  def broadcast(%Organization{} = organization, %DcPurchase{} = dc_purchase) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, dc_purchase, dc_purchase_added: "#{organization.id}/dc_purchase_added")
  end

  def broadcast_router_refill_dc_balance(%Organization{} = organization) do
    ConsoleWeb.Endpoint.broadcast("organization:all", "organization:all:refill:dc_balance", %{
      "id" => organization.id, "dc_balance_nonce" => organization.dc_balance_nonce, "dc_balance" => organization.dc_balance
    })
  end
end
