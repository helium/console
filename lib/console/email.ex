defmodule Console.Email do
  use Bamboo.Phoenix, view: ConsoleWeb.EmailView

  alias Console.Auth.User
  alias Console.ApiKeys.ApiKey
  alias Console.Organizations.Invitation
  alias Console.Organizations.Membership
  alias Console.Organizations.Organization

  def invitation_email(%Invitation{email: email, token: token, role: role}, %User{email: inviter_email}, %Organization{name: organization_name}) do
    role_hash = %{ "admin" => "Administrator", "manager" => "Manager", "read" => "Read-Only" }

    base_email()
    |> to(email)
    |> subject("You've been invited to join Helium")
    |> assign(:token, token)
    |> assign(:inviter_email, inviter_email)
    |> assign(:role, Map.fetch!(role_hash, role))
    |> assign(:organization_name, organization_name)
    |> render(:invitation_email)
  end

  def api_key_email(%User{email: email}, %ApiKey{token: token, name: name}) do
    base_email()
    |> to(email)
    |> subject("Activate your new Helium API Key")
    |> assign(:token, token)
    |> assign(:key_name, name)
    |> render(:api_key_email)
  end

  defp base_email do
    # This will use the "email.html.eex" file as a layout when rendering html emails.
    # Plain text emails will not use a layout unless you use `put_text_layout`
    new_email()
    |> from("Helium <console@helium.com>")
    |> put_header("Reply-To", "console@helium.com")
    |> put_html_layout({ConsoleWeb.LayoutView, "email.html"})
  end
end
