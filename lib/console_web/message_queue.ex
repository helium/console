defmodule ConsoleWeb.MessageQueue do
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

  def publish(message) do
    GenServer.cast(__MODULE__, {:publish, message})
  end

  def ack(tags) do
    GenServer.cast(__MODULE__, {:ack, tags})
  end

  def reject(tags) do
    GenServer.cast(__MODULE__, {:reject, tags})
  end

  def handle_cast({:connect, _}, _) do
    old_conn = ConsoleWeb.Monitor.get_amqp_conn()
    if old_conn != nil && Process.alive?(old_conn.pid) do
      # If this genserver process gets restarted without amqp restarting, close out existing connection to clear conn on amqp side
      Connection.close(old_conn)
    end

    case Connection.open("amqp://guest:guest@localhost", heartbeat: 5) do
      {:ok, conn} ->
        Process.monitor(conn.pid)
        ConsoleWeb.Monitor.update_amqp_conn(conn)

        {:ok, channel} = Channel.open(conn)
        # Basic.qos(channel, prefetch_count: 100) # For back pressure on too large of a queue
        {:ok, _} = Queue.declare(channel, "events_queue_error", durable: true)
        {:ok, _} = Queue.declare(channel, "events_queue",
           durable: true,
           arguments: [
             {"x-dead-letter-exchange", :longstr, ""},
             {"x-dead-letter-routing-key", :longstr, "events_queue_error"}
           ]
         )
        {:ok, _consumer_tag} = Basic.consume(channel, "events_queue_error", nil, no_ack: true)
        {:ok, _consumer_tag} = Basic.consume(channel, "events_queue")

        {:noreply, channel}
      {:error, _reason} ->
        :timer.sleep(5000)
        connect()

        {:noreply, nil}
    end
  end

  def handle_cast({:publish, message}, channel) do
    if channel != nil && Process.alive?(channel.pid) do
      Basic.publish(channel, "", "events_queue", message, persistent: true)
    end

    {:noreply, channel}
  end

  def handle_cast({:ack, tags}, channel) do
    if channel != nil && Process.alive?(channel.pid) do
      Basic.ack(channel, List.first(tags), multiple: true)
    end

    {:noreply, channel}
  end

  def handle_cast({:reject, tags}, channel) do
    if channel != nil && Process.alive?(channel.pid) do
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

  def handle_info({:DOWN, _, :process, _, _}, _channel) do
    connect()
    {:noreply, nil}
  end
end
