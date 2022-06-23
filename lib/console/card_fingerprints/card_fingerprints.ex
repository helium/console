defmodule Console.CardFingerprints do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.CardFingerprints.CardFingerprint

  def get_card_fingerprint(id) do
     Repo.get_by(CardFingerprint, [id: id])
  end

  def create_card_fingerprint(fingerprint) do
    %CardFingerprint{}
    |> CardFingerprint.create_changeset(%{ "id" => fingerprint })
    |> Repo.insert()
  end
end
