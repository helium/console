defmodule Console.CardFingerprints do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.CardFingerprints.CardFingerprint

  def create_card_fingerprint(fingerprint) do
    %CardFingerprint{}
    |> CardFingerprint.create_changeset(%{ "id" => fingerprint })
    |> Repo.insert()
  end
end
