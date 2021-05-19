defmodule Console.Repo.Migrations.AddConstraintToDevices do
  use Ecto.Migration

  def change do
    create constraint("devices", "dev_eui_must_be_16_chars", check: "LENGTH(dev_eui) = 16")
    create constraint("devices", "app_eui_must_be_16_chars", check: "LENGTH(app_eui) = 16")
    create constraint("devices", "app_key_must_be_32_chars", check: "LENGTH(app_key) = 32")
  end
end
