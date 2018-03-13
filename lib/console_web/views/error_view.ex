defmodule ConsoleWeb.ErrorView do
  use ConsoleWeb, :view

  # If you want to customize a particular status code
  # for a certain format, you may uncomment below.
  # def render("500.html", _assigns) do
  #   "Internal Server Error"
  # end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.html" becomes
  # "Not Found".
  def render("error.json", %{error: error}) do
    # When encoded, the changeset returns its errors
    # as a JSON object. So we just pass it forward.
    %{"errors" =>
      %{
        "error" => [error]
      }
    }
  end

  def template_not_found(template, _assigns) do
    Phoenix.Controller.status_message_from_template(template)
  end
end
