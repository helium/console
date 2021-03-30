defmodule ConsoleWeb.RouterSocket do
  use Phoenix.Socket

  channel("device:*", ConsoleWeb.DeviceChannel)
  channel("organization:*", ConsoleWeb.OrganizationChannel)
  channel("label:*", ConsoleWeb.LabelChannel)

  def connect(%{"token" => token}, socket) do
    case ConsoleWeb.Guardian.decode_and_verify(token) do
      {:ok, %{ "typ" => "router"}} ->
        {:ok, socket}
      {:error, _} ->
        :error
    end
  end

  def connect(_params, _socket) do
    :error
  end

  def id(_socket), do: nil
end
