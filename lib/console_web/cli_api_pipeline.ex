defmodule ConsoleWeb.CliApiPipeline do
  use Guardian.Plug.Pipeline, otp_app: :console

  plug ConsoleWeb.Plug.VerifyApiKey
end
