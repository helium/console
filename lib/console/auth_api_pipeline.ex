defmodule Console.AuthApiPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console

  plug Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"}
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end
