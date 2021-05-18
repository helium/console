defmodule Console.Helpers do
  def generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end

  def generate_string(length, alphabet) do
    for _ <- 1..length, into: "", do: <<Enum.random(alphabet)>>
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

  def drop_keys_with_empty_map(map) do
    Enum.filter(map, fn i ->
      {key, value} = i
      value != %{}
    end)
  end
end
