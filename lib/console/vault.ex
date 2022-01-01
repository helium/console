defmodule Console.Vault do
  use Cloak.Vault, otp_app: :console

  @impl GenServer
  def init(config) do
    config =
      Keyword.put(config, :ciphers, [
        default: {Cloak.Ciphers.AES.CTR, tag: "AES.V2", key: decode_env!("CLOAK_SECRET_KEY")},
        retired: {Cloak.Ciphers.Deprecated.AES.CTR, module_tag: "AES", tag: <<1>>, key: decode_env!("CLOAK_SECRET_KEY")}
      ])

    {:ok, config}
  end

  defp decode_env!(var) do
    case System.get_env(var) do
      nil -> Base.decode64!("/QCxhn/9t2SM8GiLXVDR1jFO/vENLGCnXADGAhGPM30=")
      key -> Base.decode64!(key)
    end
  end
end
