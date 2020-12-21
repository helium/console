defmodule Console.Jobs do
  # This module defines the jobs to be ran by Quantum scheduler 
  # as defined in config/config.exs

  def send_notification_emails do
    IO.puts "\n\n\n\nHELLO\n\n\n\n\n"
    # get events from last 5 minutes in db that have not been sent yet
    # put them in email format 
    # send email
    # mark sent
  end

  def delete_sent_notifications do 
    IO.puts "\n\n\n\n\nHOLA\n\n\n\n\n\n"
    # delete events from db that have been sent in the last hour 
  end
end