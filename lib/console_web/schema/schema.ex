defmodule ConsoleWeb.Schema do
  use Absinthe.Schema
  import_types(ConsoleWeb.Schema.Types)

  alias Console.Events

  query do
    @desc "Get all devices"
    field :devices, list_of(:device) do
      resolve(&Console.Devices.DeviceResolver.all/2)
    end

    @desc "Get a single device"
    field :device, :device do
      arg :id, non_null(:id)
      resolve &Console.Devices.DeviceResolver.find/2
    end

    @desc "Get events for a device, gateway or channel"
    field :events, list_of(:event) do
      arg :device_id, :id
      resolve(&Console.Events.EventResolver.all/2)
    end
  end

  def context(ctx) do
    loader =
      Dataloader.new
      |> Dataloader.add_source(Events, Events.data())

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end

end
