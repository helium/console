defmodule Console.Repo.Migrations.ChangeFormatOfDeviceKey do
  use Ecto.Migration

  def up do
    devices = Console.Devices.list_devices()

    Enum.each(devices, fn device ->
      key = device.key
        |> String.split(", ")
        |> Enum.map(fn x -> x |> String.slice(2,3) |> to_charlist() |> List.to_integer(16) end)
        |> :erlang.list_to_binary()
        |> :base64.encode

      changeset = Ecto.Changeset.change(device, key: key)
      Console.Repo.update!(changeset)
    end)
  end

  def down do
    devices = Console.Devices.list_devices()

    Enum.each(devices, fn device ->
      key = device.key
        |> :base64.decode
        |> :erlang.binary_to_list()
        |> Enum.map(fn b -> :io_lib.format("0x~.16B", [b]) |> to_string() end)
        |> Enum.join(", ")

      changeset = Ecto.Changeset.change(device, key: key)
      Console.Repo.update!(changeset)
    end)
  end
end
