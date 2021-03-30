defmodule ConsoleWeb.Auth0View do
  use ConsoleWeb, :view

  def render("show.json", %{enrollment_status: enrollment_status}) do
    %{
      enrollment_status: enrollment_status
    }
  end
end
