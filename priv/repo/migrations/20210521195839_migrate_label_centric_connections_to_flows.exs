defmodule Console.Repo.Migrations.MigrateLabelCentricConnectionsToFlows do
  use Ecto.Migration

  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Flows.Flow

  def up do
    # START LABEL FUNCTION CHANNEL FLOW TABLE MIGRATION
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
    # END LABEL FUNCTION CHANNEL FLOW TABLE MIGRATION

    # START TRANSACTION
    Repo.insert_all(Flow, flows_attrs, on_conflict: :nothing)
    # END TRANSACTION
  end

  def down do
    Repo.delete_all(Flow)
  end

  defp put_timestamps(struct) do
    struct
    |> Map.put(:inserted_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
    |> Map.put(:updated_at, NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second))
  end
end
