defmodule ConsoleWeb.AcceptedTermsController do
  use ConsoleWeb, :controller

  alias Console.AcceptedTerms
  alias Console.AcceptedTerms.AcceptedTerm

  action_fallback(ConsoleWeb.FallbackController)

  def get_by_email(conn, %{"email" => email}) do
    case AcceptedTerms.get_accepted_term(email, Application.get_env(:console, :latest_terms_version)) do
      %AcceptedTerm{} = accepted_term ->
        render(conn, "show.json", accepted_term: accepted_term)
      _ ->
        conn
        |> send_resp(:ok, Poison.encode!(%{accepted: false}))
    end
  end

  def create(conn, %{"email" => email}) do
    attrs = %{ "email" => email, "version" => Application.get_env(:console, :latest_terms_version)}

    case AcceptedTerms.create_accepted_term(attrs) do
      {:ok, _} ->
        conn
        |> send_resp(:no_content, "")
      _ ->
        {:error, :internal_server_error, "Could not save terms acceptance"}
    end
  end
end
