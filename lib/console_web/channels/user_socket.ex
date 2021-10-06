defmodule ConsoleWeb.UserSocket do
  use Phoenix.Socket
  use Absinthe.Phoenix.Socket, schema: ConsoleWeb.Schema
  alias Console.Organizations
  alias Console.Auth
  require Logger

  channel("graphql:*", ConsoleWeb.GraphqlChannel)

  @access_token_decoder Application.get_env(:console, :access_token_decoder)

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
    if Application.get_env(:console, :use_magic_auth) do
      case ConsoleWeb.Guardian.decode_and_verify(token) do
        {:ok, %{ "typ" => "magic-auth-session", "sub" => user_id, "email" => email }} ->
          case Auth.get_user_by_id_and_email(user_id, email)
            |> Organizations.get_current_organization(organization_id) do
            %{organization: current_organization} ->
              authed_socket = Absinthe.Phoenix.Socket.put_options(socket, context: %{
                current_organization_id: current_organization.id,
                current_user_id: user_id
              })
              {:ok, authed_socket}
            _ ->
              :error
          end
        _ ->
          :error
      end
    else
      case @access_token_decoder.decode_conn_access_token(token) do
        %{email: email, user_id: user_id} ->
          case Auth.get_user_by_id_and_email(user_id, email)
            |> Organizations.get_current_organization(organization_id) do
            %{organization: current_organization} ->
              authed_socket = Absinthe.Phoenix.Socket.put_options(socket, context: %{
                current_organization_id: current_organization.id,
                current_user_id: user_id
              })
              {:ok, authed_socket}
            _ ->
              :error
          end
        :error ->
          :error
      end
    end
  end

  def connect(_params, _socket) do
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
