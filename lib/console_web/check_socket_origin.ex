defmodule ConsoleWeb.CheckSocketOrigin do
  def validate_request_origin(%URI{ host: request_host, scheme: request_scheme }) do
    origin = String.split(Application.get_env(:console, :socket_check_origin), "//")
    origin_scheme = List.first(origin) |> String.replace_suffix(":", "")
    origin_host = List.last(origin)

    if request_host == origin_host do
      if origin_scheme != "" and origin_scheme != request_scheme do
        false
      else
        true
      end
    else
      false
    end
  end
end
