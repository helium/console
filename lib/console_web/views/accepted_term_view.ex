defmodule ConsoleWeb.AcceptedTermsView do
  use ConsoleWeb, :view

  def render("show.json", %{accepted_term: accepted_term}) do
    %{
      email: accepted_term.email,
      version: accepted_term.version,
      accepted: true
    }
  end
end
