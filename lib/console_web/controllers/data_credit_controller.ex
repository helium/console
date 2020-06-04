defmodule ConsoleWeb.DataCreditController do
  use ConsoleWeb, :controller
  alias Console.Repo
  alias Console.Organizations
  alias Console.Organizations.Organization

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create_customer_id_and_charge(conn, %{ "amountUSD" => amountUSD }) do
    current_organization = conn.assigns.current_organization

    headers = [
      {"Authorization", "Bearer " <> "sk_test_Lvy2r3SRCzwjfh3tvZsOBTrG00Cm8M7v1q"},
      {"Content-Type", "application/x-www-form-urlencoded"}
    ]

    request_body = URI.encode_query(%{
      "name" => current_organization.name,
      "description" => current_organization.id,
    })
    # create a customer id in stripe
    with {:ok, stripe_response} <- HTTPoison.post("https://api.stripe.com/v1/customers", request_body, headers) do
       with 200 <- stripe_response.status_code do
         customer = Poison.decode!(stripe_response.body)
         with {:ok, %Organization{} = organization} <- Organizations.update_organization(current_organization, %{ "stripe_customer_id" => customer["id"]}) do
           # create a payment intent in stripe
           amount = String.to_integer(amountUSD) * 100
           request_body = URI.encode_query(%{
             "customer" => organization.stripe_customer_id,
             "amount" => amount,
             "currency" => "usd"
           })

           with {:ok, stripe_response} <- HTTPoison.post("https://api.stripe.com/v1/payment_intents", request_body, headers) do
             payment_intent = Poison.decode!(stripe_response.body)
             conn |> send_resp(:ok, Poison.encode!(%{ payment_intent_secret: payment_intent["client_secret"] }))
           end
         end
       end
    end
  end
end
