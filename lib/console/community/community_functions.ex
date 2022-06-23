defmodule Console.CommunityFunctions do
  @browan_object_locator_body File.read!("community_functions/browan_object_locator.txt")
  @cayenne_lpp_body File.read!("community_functions/cayenne.txt")

  def inject_body(function, show_underlying_format \\ true) do
    case function.format do
      "cayenne" ->
        function
        |> Map.put(:body, @cayenne_lpp_body)
        |> Map.put(:format, (if show_underlying_format, do: function.format, else: "custom"))
      "browan_object_locator" ->
        function
        |> Map.put(:body, @browan_object_locator_body)
        |> Map.put(:format, (if show_underlying_format, do: function.format, else: "custom"))
      _ ->
        function
    end
  end
end
