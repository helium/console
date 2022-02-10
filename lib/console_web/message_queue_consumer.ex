defmodule ConsoleWeb.MessageQueueConsumer do
  use GenServer
  use AMQP

  def start_link(initial_state) do
    GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def init(_opts) do
    if Application.get_env(:console, :use_amqp_events) do
      connect()
    end

    {:ok, nil}
  end

  def connect() do
    GenServer.cast(__MODULE__, {:connect, nil})
  end

  def ack(tags) do
    GenServer.cast(__MODULE__, {:ack, tags})
  end

  def reject(tags) do
    GenServer.cast(__MODULE__, {:reject, tags})
  end

  def handle_cast({:connect, _}, _) do
    old_conn = ConsoleWeb.Monitor.get_amqp_consume_conn()
    if old_conn != nil && Process.alive?(old_conn.pid) do
      # If this genserver process gets restarted without amqp restarting, close out existing connection to clear conn on amqp side
      Connection.close(old_conn)
    end

    case Connection.open(Application.get_env(:console, :amqp_url)) do
      {:ok, conn} ->
        IO.inspect "CONSUMER SUCCESSFUL CONNECT TO AMQP"
        ConsoleWeb.Monitor.update_amqp_consume_conn(conn)

        {:ok, channel} = Channel.open(conn)
        Process.monitor(channel.pid)

        {:ok, _consumer_tag} = Basic.consume(channel, "events_queue_error", nil, no_ack: true)
        {:ok, _consumer_tag} = Basic.consume(channel, "events_queue")

        {:noreply, channel}
      {:error, reason} ->
        IO.inspect "CONSUMER FAILED TO CONNECT TO AMQP"
        IO.inspect reason
        :timer.sleep(5000)
        connect()

        {:noreply, nil}
    end
  end

  def handle_cast({:ack, tags}, channel) do
    if channel != nil do
      Basic.ack(channel, List.first(tags), multiple: true)
    end

    {:noreply, channel}
  end

  def handle_cast({:reject, tags}, channel) do
    if channel != nil do
      Basic.nack(channel, List.first(tags), [requeue: false, multiple: true])
    end

    {:noreply, channel}
  end

  # Confirmation sent by the broker after registering this process as a consumer
  def handle_info({:basic_consume_ok, %{consumer_tag: _consumer_tag}}, channel) do
    {:noreply, channel}
  end

  # Sent by the broker when the consumer is unexpectedly cancelled (such as after a queue deletion)
  def handle_info({:basic_cancel, %{consumer_tag: _consumer_tag}}, channel) do
    {:stop, :normal, channel}
  end

  # Confirmation sent by the broker to the consumer process after a Basic.cancel
  def handle_info({:basic_cancel_ok, %{consumer_tag: _consumer_tag}}, channel) do
    {:noreply, channel}
  end

  def handle_info({:basic_deliver, payload, %{routing_key: routing_key, delivery_tag: tag, redelivered: _redelivered}}, channel) do
    case routing_key do
      "events_queue" -> ConsoleWeb.Monitor.add_to_events_state(tag, payload)
      "events_queue_error" -> ConsoleWeb.Monitor.add_to_events_error_state(payload)
    end
    {:noreply, channel}
  end

  def handle_info({:DOWN, _, :process, _, reason}, _channel) do
    IO.inspect reason
    { _,{ _, _, message}} = reason
    Appsignal.send_error(%RuntimeError{ message: message }, "AMQP Consumer channel closed", ["message_queue_consumer.ex"])

    connect()
    {:noreply, nil}
  end
end
