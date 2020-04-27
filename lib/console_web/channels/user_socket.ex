defmodule ConsoleWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket, schema: ConsoleWeb.Schema
  alias Console.Organizations
  alias Console.Organizations.Organization
  alias Console.Auth.User
  require Logger

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  def connect(%{"token" => token, "organization_id" => organization_id}, socket) do
    response = HTTPoison.get!("#{Application.get_env(:console, :auth0)[:app_baseurl]}/.well-known/jwks.json")
    key = Poison.decode!(response.body)
    head = Enum.at(key["keys"], 0)
    signer = Joken.Signer.create("RS256", head)
    case Joken.verify(token, signer) do
      {:ok, data} ->
        user_id = String.replace(data["sub"], "auth0|", "")
        IO.inspect organization_id
        case Organizations.get_organization(%User{id: user_id, super: false}, organization_id) do
          %Organization{} = current_organization ->
            authed_socket = Absinthe.Phoenix.Socket.put_options(socket, context: %{
              current_organization_id: current_organization.id,
              current_user_id: user_id
            })
            {:ok, authed_socket}
          _ -> {:error}
        end
      {:error, _} -> {:error}
    end
  end

  def connect(_params, socket) do
    :error
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     ConsoleWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  def id(_socket), do: nil
end
