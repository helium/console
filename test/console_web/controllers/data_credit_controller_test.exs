defmodule ConsoleWeb.DataCreditControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "data credits" do
    setup [:authenticate_user]

    test "successfully gets hnt price", %{conn: conn} do
      resp_conn = get conn, data_credit_path(conn, :get_hnt_price)
      response = response(resp_conn, 200)
      assert response != nil
      {:ok, response_json} = Poison.decode(response)
      assert Map.has_key?(response_json, "price")
      assert Map.has_key?(response_json, "next_price_timestamp")
    end
  end
end