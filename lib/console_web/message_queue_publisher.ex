defmodule ConsoleWeb.MessageQueuePublisher do
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

  def handle_cast({:connect, _}, _) do
    old_conn = ConsoleWeb.Monitor.get_amqp_publish_conn()
    if old_conn != nil && Process.alive?(old_conn.pid) do
      # If this genserver process gets restarted without amqp restarting, close out existing connection to clear conn on amqp side
      Connection.close(old_conn)
    end

    case Connection.open(Application.get_env(:console, :amqp_url)) do
      {:ok, conn} ->
        IO.inspect "PUBLISHER SUCCESSFUL CONNECT TO AMQP"
        ConsoleWeb.Monitor.update_amqp_publish_conn(conn)

        {:ok, channel} = Channel.open(conn)
        Process.monitor(channel.pid)

        # Basic.qos(channel, prefetch_count: 100) # For back pressure on too many events being processed by etl worker
        {:ok, _} = Queue.declare(channel, "events_queue_error", durable: true)
        {:ok, _} = Queue.declare(channel, "events_queue",
           durable: true,
           arguments: [
             {"x-dead-letter-exchange", :longstr, ""},
             {"x-dead-letter-routing-key", :longstr, "events_queue_error"}
           ]
         )

        {:noreply, channel}
      {:error, reason} ->
        IO.inspect "PUBLISHER FAILED TO CONNECT TO AMQP"
        IO.inspect reason
        :timer.sleep(5000)
        connect()

        {:noreply, nil}
    end
  end

  def handle_cast({:publish, message}, channel) do
    if channel != nil do
      Basic.publish(channel, "", "events_queue", message, [persistent: true, expiration: 60000])
    end

    {:noreply, channel}
  end

  def handle_info({:DOWN, _, :process, _, reason}, _channel) do
    IO.inspect reason
    { _,{ _, _, message}} = reason
    Appsignal.send_error(%RuntimeError{ message: message }, "AMQP Publish channel closed", ["message_queue_publisher.ex"])

    connect()
    {:noreply, nil}
  end
end
