defmodule Console.Repo.Migrations.ConvertAppKeyAndEui do
  use Ecto.Migration
  import Ecto.Query, only: [from: 2]

  def up do
    devices = from(d in Console.Devices.Device, select: %{id: d.id, key: d.key, oui: d.oui, seq_id: d.seq_id}) |> Console.Repo.all

    Enum.each(devices, fn device ->
      app_key =
        case device.key do
          nil -> nil
          _ -> device.key |> Base.decode64! |> Base.encode16

      app_eui =
        case device.seq_id do
          nil -> nil
          _ ->
            hex = device.seq_id |> Integer.to_string(16)
            str = "00000000" <> hex
            "00000001" <> String.slice(str, -8..-1)

      changeset = Ecto.Changeset.change(device, %{ app_key: app_key, app_eui: app_eui })
      Console.Repo.update!(changeset)
    end)
  end

  def down do
    devices = from(d in Console.Devices.Device, select: %{id: d.id, key: d.key}) |> Console.Repo.all

    Enum.each(devices, fn device ->
      changeset = Ecto.Changeset.change(device, %{ app_key: nil, app_eui: nil })
      Console.Repo.update!(changeset)
    end)
  end
end
