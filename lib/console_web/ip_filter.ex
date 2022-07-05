defmodule ConsoleWeb.IPFilter do
  def get_ip(conn) do
    forwarded_for = List.first(Plug.Conn.get_req_header(conn, "x-forwarded-for"))

    if forwarded_for do
      String.split(forwarded_for, ",")
      |> Enum.map(&String.trim/1)
      |> List.first()
    else
      to_string(:inet_parse.ntoa(conn.remote_ip))
    end
  end

  def check_ip_restriction(ip) do
    unsupported_countries =
      Application.get_env(:console, :unsupported_countries) |> String.trim(",") |> String.replace(" ", "") |> String.split(",")
    unsupported_cities =
      Application.get_env(:console, :unsupported_cities) |> String.trim(",") |> String.replace(" ", "") |> String.split(",")
    unsupported_ukr_subdivisions =
      Application.get_env(:console, :unsupported_ukr_subdivisions) |> String.trim(",") |> String.replace(" ", "") |> String.split(",")

    ip_location = Geolix.lookup(ip, where: :geolite2_city)

    if is_nil(ip_location) do # in case of failing db, ip not found
      Appsignal.send_error(%RuntimeError{ message: ip }, "Unable to find IP in database", ["ip_filter.ex"])
      false
    else
      cond do
        ip_location.country.iso_code in unsupported_countries ->
          true
        ip_location.country.iso_code == "UA" and List.first(ip_location.subdivisions).iso_code in unsupported_ukr_subdivisions ->
          true
        ip_location.city.name in unsupported_cities ->
          true
        true -> false
      end
    end
  end
end