defmodule Console.Repo.Migrations.AddTypeNameToChannels do
  use Ecto.Migration

  def up do
    alter table("channels") do
      add :type_name, :string
    end

    execute """
    UPDATE channels
    SET type_name = 'AWS IoT'
    WHERE type = 'aws'
    """

    execute """
    UPDATE channels
    SET type_name = 'Azure IoT Hub'
    WHERE type = 'azure'
    """

    execute """
    UPDATE channels
    SET type_name = 'Google Cloud IoT Core'
    WHERE type = 'google'
    """

    execute """
    UPDATE channels
    SET type_name = 'MQTT'
    WHERE type = 'mqtt'
    """

    execute """
    UPDATE channels
    SET type_name = 'HTTP'
    WHERE type = 'http'
    """

    alter table("channels") do
      modify :type_name, :string, null: false
    end
  end

  def down do
    alter table("channels") do
      remove :type_name
    end
  end
end
