defmodule ConsoleWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  use ConsoleWeb, :controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ConsoleWeb.ChangesetView)
    |> render("error.json", changeset: changeset)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("404.html")
  end

  def call(conn, {:error, :forbidden, error}) do
    conn
    |> put_status(:forbidden)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("error.json", error: error)
  end

  def call(conn, {:error, :unprocessable_entity, error}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("error.json", error: error)
  end

  def call(conn, {:error, :unauthorized, error}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("error.json", error: error)
  end

  def call(conn, {:error, :not_found, error}) do
    conn
    |> put_status(:not_found)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("error.json", error: error)
  end

  def call(conn, {:error, :bad_request, error}) do
    conn
    |> put_status(:bad_request)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("error.json", error: error)
  end

  def call(conn, {:error, :internal_server_error, error}) do
    conn
    |> put_status(:internal_server_error)
    |> put_view(ConsoleWeb.ErrorView)
    |> render("error.json", error: error)
  end
end
