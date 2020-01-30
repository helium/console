defmodule Console.Email do
  use Bamboo.Phoenix, view: ConsoleWeb.EmailView

  alias Console.Auth.User
  alias Console.Organizations.Invitation
  alias Console.Organizations.Membership
  alias Console.Organizations.Organization

  def confirm_email(%User{email: email, confirmation_token: token}) do
    base_email()
    |> to(email)
    |> subject("Confirm your Helium Console account")
    |> assign(:token, token)
    |> render(:confirm_email)
  end

  def password_reset_email(%User{email: email}, token) do
    base_email()
    |> to(email)
    |> subject("Your Helium Password Reset Link")
    |> assign(:token, token)
    |> render(:reset_password)
  end

  def invitation_email(%Invitation{email: email, token: token}) do
    base_email()
    |> to(email)
    |> subject("You've been invited to join Helium")
    |> assign(:token, token)
    |> render(:invitation_email)
  end

  def joined_organization_email(%Membership{user: %User{email: email}, organization: %Organization{name: organization_name}}) do
    base_email()
    |> to(email)
    |> subject("You've been added to #{organization_name} on Helium")
    |> assign(:organization_name, organization_name)
    |> render(:joined_organization_email)
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
