defmodule ConsoleWeb.Receiver do
  use GenServer

  #Client
  def start_link(initial_state) do
    GenServer.start_link(__MODULE__, initial_state)
  end

  #Server
  def init(events) do
    {:ok, connection} = AMQP.Connection.open
    {:ok, channel} = AMQP.Channel.open(connection)
    {:ok, _} = AMQP.Queue.declare(channel, "events_queue")
    AMQP.Queue.subscribe(channel, "events_queue", fn payload, _meta -> IO.puts("Received: #{payload}") end)

    {:ok, events}
  end

  def handle_info({:basic_consume_ok, _}, events) do
    {:noreply, events}
  end

  def handle_info({:basic_deliver, payload, %{delivery_tag: tag, redelivered: redelivered}}, events) do
    # You might want to run payload consumption in separate Tasks in production
    IO.inspect payload
    IO.inspect tag
    IO.inspect redelivered
    IO.inspect payload
    {:noreply, events}
  end
end
