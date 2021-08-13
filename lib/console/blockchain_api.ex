defmodule Console.BlockchainApi do
  use HTTPoison.Base
  require HTTPoison.Retry
  alias HTTPoison.Response
  alias HTTPoison.Retry

  def each_page(url, fun, cursor \\ nil) do
    case get_json(url, %{cursor: cursor}) do
      {:ok, %{"data" => data, "cursor" => next_cursor}} ->
        fun.(data)
        each_page(url, fun, next_cursor)

      {:ok, %{"data" => data}} ->
        fun.(data)
        :ok

      {:error, error} ->
        {:error, error}
    end
  end

  def get_json(url, params \\ %{}) do
    case get("#{Application.get_env(:console, :blockchain_api_url)}#{url}", [], params: params)
         |> Retry.autoretry(
           max_attempts: Application.get_env(:console, :blockchain_api_retry),
           wait: 15000,
           include_404s: true,
           retry_unknown_errors: true
         ) do
      {:ok, %Response{body: body, status_code: status_code}} ->
        case status_code do
          200 ->
            {:ok, body |> Jason.decode!()}

          400 ->
            {:error, :cursor_invalid}

          404 ->
            {:error, :not_found}

          503 ->
            {:error, :too_busy}

          _ ->
            {:error, String.to_atom("unknown_#{status_code}")}
        end

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, reason}
    end
  end
end