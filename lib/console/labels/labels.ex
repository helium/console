defmodule Console.Labels do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Labels.Label

  def get_label!(id), do: Repo.get!(Label, id)

  def create_label(attrs \\ %{}) do
    %Label{}
    |> Label.changeset(attrs)
    |> Repo.insert()
  end

  # def update_device(%Device{} = device, attrs) do
  #   device
  #   |> Device.changeset(attrs)
  #   |> Repo.update()
  # end
  #
  def delete_label(%Label{} = label) do
    Repo.delete(label)
  end
end
