defmodule Console.AcceptedTerms do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.AcceptedTerms.AcceptedTerm

  def get_accepted_term(email, version) do
    Repo.get_by(AcceptedTerm, [email: email, version: version])
  end

  def create_accepted_term(attrs \\ %{}) do
    %AcceptedTerm{}
    |> AcceptedTerm.changeset(attrs)
    |> Repo.insert()
  end
end
