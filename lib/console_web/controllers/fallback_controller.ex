defmodule ConsoleWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  use ConsoleWeb, :controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> render(ConsoleWeb.ChangesetView, "error.json", changeset: changeset)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> render(ConsoleWeb.ErrorView, :"404")
  end

  def call(conn, {:error, :forbidden, error}) do
    conn
    |> put_status(:forbidden)
    |> render(ConsoleWeb.ErrorView, "error.json", error: error)
  end

  def call(conn, {:error, :unprocessable_entity, error}) do
    conn
    |> put_status(:unprocessable_entity)
    |> render(ConsoleWeb.ErrorView, "error.json", error: error)
  end

  def call(conn, {:error, :unauthorized, error}) do
    conn
    |> put_status(:unauthorized)
    |> render(ConsoleWeb.ErrorView, "error.json", error: error)
  end

  def call(conn, {:error, :not_found, error}) do
    conn
    |> put_status(:not_found)
    |> render(ConsoleWeb.ErrorView, "error.json", error: error)
  end
end
