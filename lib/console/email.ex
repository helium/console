defmodule Console.Email do
  use Bamboo.Phoenix, view: ConsoleWeb.EmailView

  def welcome_email(address) do
    base_email()
    |> to(address)
    |> subject("Your Sign In Link")
    |> assign(:address, address)
    |> render(:confirm_email)
  end

  defp base_email do
    new_email()
    |> from("Helium <dashboard@helium.com>")
    |> put_header("Reply-To", "dashboard@helium.com")
    # This will use the "email.html.eex" file as a layout when rendering html emails.
    # Plain text emails will not use a layout unless you use `put_text_layout`
    |> put_html_layout({ConsoleWeb.LayoutView, "email.html"})
  end

end
