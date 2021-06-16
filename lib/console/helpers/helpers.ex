defmodule Console.Helpers do
  def time_ago_more_than?(datetime, num, period) do
    time_difference_in_seconds(DateTime.utc_now(), DateTime.from_naive!(datetime, "Etc/UTC")) > time_in_seconds(num, period)
  end

  def time_difference_in_seconds(datetime1, datetime2) do
    DateTime.diff(datetime1, datetime2)
  end

  def time_in_seconds(num, period) do
    case period do
      "Day" -> 24 * 60 * 60 * num
    end
  end

  def generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end

  def generate_string(length, alphabet) do
    for _ <- 1..length, into: "", do: <<Enum.random(alphabet)>>
  end

  def geocodeLatLng(lat, lng) do
    case HTTPoison.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=#{lat},#{lng}&key=#{Application.get_env(:console, :google_maps_secret)}") do
      {:ok, response} ->
        case response.status_code do
          200 ->
            responseBody = Poison.decode!(response.body)

            case List.first(responseBody["results"]) do
              %{"address_components" => address_components} ->
                city = Enum.find(address_components, fn c -> c["types"] == ["locality", "political"] end)["long_name"] || "Unknown"
                state = Enum.find(address_components, fn c -> c["types"] == ["administrative_area_level_1", "political"] end)["long_name"] || "Unknown"
                country = Enum.find(address_components, fn c -> c["types"] == ["country", "political"] end)["short_name"] || "Unknown"
                "#{city}, #{state}, #{country}"
              _ -> "unknown_location"
            end
          _ -> "api_call_failed"
        end
      _ -> "api_call_failed"
    end
  end

  def sanitize_attrs(attrs, keys) do
    attrs = Enum.reduce(keys, attrs, fn key, acc ->
      case Map.get(attrs, key) do
        nil -> acc
        value ->
          clean_value = value |> HtmlSanitizeEx.strip_tags()
          Map.put(acc, key, clean_value)
      end
    end)
    attrs
  end

  def upcase_attrs(attrs, keys) do
    attrs = Enum.reduce(keys, attrs, fn key, acc ->
      case Map.get(attrs, key) do
        nil -> acc
        value ->
          Map.put(acc, key, String.upcase(value))
      end
    end)
    attrs
  end

  def check_special_characters(string) do
    String.match?(string, ~r/^[A-Za-z0-9\(\)\[\]\-\_\+\|\!\?\:\s]+$/)
  end

  def order_with_nulls(order) do
    case order do
      "asc" -> "asc_nulls_first"
      "desc" -> "desc_nulls_last"
    end
  end
end
