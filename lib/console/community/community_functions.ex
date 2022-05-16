defmodule Console.CommunityFunctions do
  def inject_body(function, show_underlying_format \\ true) do
    case function.format do
      "cayenne" ->
        function
        |> Map.put(:body, "test cayenne body")
        |> Map.put(:format, (if show_underlying_format, do: function.format, else: "custom"))
      "browan_object_locator" ->
        function
        |> Map.put(:body, "test browan body")
        |> Map.put(:format, (if show_underlying_format, do: function.format, else: "custom"))
      _ ->
        function
    end
  end
end
