defmodule Console.Repo.Migrations.MigrateLabelCentricConnectionsToFlows do
  use Ecto.Migration

  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Labels
  alias Console.Labels.Label
  alias Console.Flows.Flow
  alias Console.MultiBuys.MultiBuy

  def up do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:flows, fn _repo, _ ->
      channels_labels_sql = """
        SELECT * FROM channels_labels
      """
      all_channels_labels = Ecto.Adapters.SQL.query!(Console.Repo, channels_labels_sql, []).rows

      label_sql = """
        SELECT name, function_id, organization_id FROM labels where id = $1
      """

      flows_attrs =
        Enum.map(all_channels_labels, fn cl ->
          {:ok, label_id} = Enum.at(cl, 2) |> Ecto.UUID.load
          {:ok, channel_id} = Enum.at(cl, 1) |> Ecto.UUID.load

          label = Ecto.Adapters.SQL.query!(Console.Repo, label_sql, [Enum.at(cl, 2)]).rows |> Enum.at(0)
          {:ok, organization_id} = Enum.at(label, 2) |> Ecto.UUID.load

          case Enum.at(label, 1) do
            nil ->
              %{
                label_id: label_id,
                channel_id: channel_id,
                organization_id: organization_id
              }
              |> put_timestamps
            value ->
              {:ok, function_id} = value |> Ecto.UUID.load

              %{
                label_id: label_id,
                channel_id: channel_id,
                organization_id: organization_id,
                function_id: function_id
              }
              |> put_timestamps
          end
        end)

      {count, _} = Repo.insert_all(Flow, flows_attrs, on_conflict: :nothing)
      if count == length(flows_attrs) do
        {:ok, count}
      else
        {:error, "FATAL ERROR: Could not create all flows"}
      end
    end)
    |> Ecto.Multi.run(:multi_buys, fn _repo, %{ flows: _ } ->
      all_labels_with_mbs_sql = """
        SELECT id, multi_buy, organization_id FROM labels WHERE multi_buy > 1
      """
      all_labels_with_mbs = Ecto.Adapters.SQL.query!(Console.Repo, all_labels_with_mbs_sql, []).rows

      Enum.each(all_labels_with_mbs, fn label ->
        {:ok, label_id} = Enum.at(label, 0) |> Ecto.UUID.load
        {:ok, organization_id} = Enum.at(label, 2) |> Ecto.UUID.load
        multi_buy_value = Enum.at(label, 1)

        label_to_update = Labels.get_label!(label_id)
        existing_mb_in_org = Repo.get_by(MultiBuy, [value: multi_buy_value, organization_id: organization_id])

        case existing_mb_in_org do
          nil ->
            name =
              case multi_buy_value do
                10 -> "All Available"
                _ -> "Up to " <> to_string(multi_buy_value)
              end

            new_multi_buy =
              %MultiBuy{}
              |> MultiBuy.changeset(%{
                name: name,
                organization_id: organization_id,
                value: multi_buy_value
              })
              |> Repo.insert!()

            label_to_update
            |> Label.changeset(%{
              multi_buy_id: new_multi_buy.id
            })
            |> Repo.update!()
          multi_buy ->
            label_to_update
            |> Label.changeset(%{
              multi_buy_id: multi_buy.id
            })
            |> Repo.update!()
        end
      end)

      {:ok, "Success"}
    end)
    |> Repo.transaction()
  end

  def down do
    Repo.delete_all(Flow)
    Repo.delete_all(MultiBuy)
  end

  defp put_timestamps(struct) do
    struct
    |> Map.put(:inserted_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
    |> Map.put(:updated_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
  end
end
