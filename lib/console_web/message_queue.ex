defmodule ConsoleWeb.MessageQueue do
  use GenServer
  use AMQP

  def start_link(initial_state) do
    GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def init(_opts) do
    if Application.get_env(:console, :use_amqp_events) do
      case ConsoleWeb.Monitor.get_amqp_conn() do
        nil -> nil
        old_conn -> Connection.close(old_conn)
      end

      channel = establish_conn()

      {:ok, channel}
    else
      {:ok, nil}
    end
  end

  def publish(message) do
    GenServer.cast(__MODULE__, {:publish, message})
  end

  def ack(tags) do
    GenServer.cast(__MODULE__, {:ack, tags})
  end

  def handle_cast({:publish, message}, channel) do
    Basic.publish(channel, "", "events_queue", message, persistent: true)
    {:noreply, channel}
  end

  def handle_cast({:ack, tags}, channel) do
    Enum.each(tags, fn tag ->
      Basic.ack(channel, tag)
    end)
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

  def handle_info({:basic_deliver, payload, %{delivery_tag: tag, redelivered: _redelivered}}, channel) do
    ConsoleWeb.Monitor.add_to_events_state(tag, payload)
    {:noreply, channel}
  end

  defp establish_conn() do
    case Connection.open("amqp://guest:guest@localhost") do
      {:ok, conn} ->
        ConsoleWeb.Monitor.update_amqp_conn(conn)
        {:ok, channel} = Channel.open(conn)
        {:ok, _} = Queue.declare(channel, "events_queue", durable: true)
        {:ok, _consumer_tag} = Basic.consume(channel, "events_queue")
        channel
      {:error, reason} ->
        :timer.sleep(5000)
        establish_conn()
    end
  end

  # defp consume(channel, tag, redelivered, payload) do
  #   number = String.to_integer(payload)
  #   :ok = Basic.ack channel, tag
  #   # DO NOT ACK ABOVE UNTIL THE EVENTS ARE transformed and stored
  #   IO.puts "Consumed a #{number}."
  #
  # rescue
  #   # Requeue unless it's a redelivered message.
  #   # This means we will retry consuming a message once in case of exception
  #   # before we give up and have it moved to the error queue
  #   #
  #   # You might also want to catch :exit signal in production code.
  #   # Make sure you call ack, nack or reject otherwise consumer will stop
  #   # receiving messages.
  #   exception ->
  #     :ok = Basic.reject channel, tag, requeue: not redelivered
  #     IO.puts "Error converting #{payload} to integer"
  # end
end
