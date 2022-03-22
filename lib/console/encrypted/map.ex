defmodule Console.Encrypted.Map do
  # use Ecto.Type
  use Cloak.Ecto.Map, vault: Console.Vault
end
