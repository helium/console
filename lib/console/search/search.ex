defmodule Console.Search do
  alias Console.Repo
  alias Console.Helpers
  import Ecto.Query
  alias Console.Organizations.Organization
  alias Console.Hotspots.Hotspot
  alias Console.Flows
  @sim_limit 0.05

  # When query is empty, just return an array
  def run(query, _organization) when byte_size(query) == 0 do
    []
  end

  # When queries are 1-2 characters, we can't use trigram search so we check
  # if any items start with the query and assign them a score of 1.0, and then
  # we check if any items contain but don't start with the query and assign
  # them a score of 0.5
  def run(query, %Organization{id: organization_id}) when byte_size(query) < 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, dev_eui AS description, 1.0::float AS score, 'devices' AS category
            FROM devices
            WHERE organization_id = $3 AND (name ILIKE $1 OR dev_eui ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, dev_eui AS description, 0.5::float AS score, 'devices' AS category
            FROM devices
            WHERE organization_id = $3 AND (name ~* $2 OR dev_eui ~* $2)
          )
        ) a ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, type_name AS description, 1.0::float AS score, 'channels' AS category
            FROM channels
            WHERE organization_id = $3 AND (name ILIKE $1 OR type_name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, type_name AS description, 0.5::float AS score, 'channels' AS category
            FROM channels
            WHERE organization_id = $3 AND (name ~* $2 OR type_name ~* $2)
          )
        ) b ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, 'created by ' || creator AS description, 1.0::float AS score, 'labels' AS category
            FROM labels
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, 'created by ' || creator AS description, 0.5::float AS score, 'labels' AS category
            FROM labels
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) c ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, format AS description, 1.0::float AS score, 'functions' AS category
            FROM functions
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, format AS description, 0.5::float AS score, 'functions' AS category
            FROM functions
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) d ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, node_type || ' alert' AS description, 1.0::float AS score, 'alerts' AS category
            FROM alerts
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, node_type || ' alert' AS description, 0.5::float AS score, 'alerts' AS category
            FROM alerts
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) e ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, 'Packet Config' AS description, 1.0::float AS score, 'packet_configs' AS category
            FROM packet_configs
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, 'Packet Config' AS description, 0.5::float AS score, 'packet_configs' AS category
            FROM packet_configs
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) f ORDER BY id, score DESC)
      ) g
      ORDER BY score DESC
      LIMIT 5
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, organization_id])
    to_json(result)
  end

  # When queries are 3+ characters, we can use Postgres trigram search
  def run(query, %Organization{id: organization_id}) when byte_size(query) >= 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
    (
      SELECT id, name AS title, dev_eui AS description, score, 'devices' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM devices
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS a
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, dev_eui AS description, score, 'devices' AS category
      FROM (
        SELECT *, SIMILARITY(dev_eui || ' ', $1) AS score
        FROM devices
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS a
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, type_name AS description, score, 'channels' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM channels
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS b
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, type_name AS description, score, 'channels' AS category
      FROM (
        SELECT *, SIMILARITY(type_name || ' ', $1) AS score
        FROM channels
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS b
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, 'created by ' || creator AS description, score, 'labels' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM labels
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS c
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, format AS description, score, 'functions' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM functions
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS b
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, node_type || ' alert' AS description, score, 'alerts' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM alerts
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS b
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, 'Packet Config' AS description, score, 'packet_configs' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM packet_configs
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS b
      WHERE score > $3
    )
    ORDER BY score DESC
    LIMIT 5
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result)
  end

  def run_for_devices(query, _organization) when byte_size(query) == 0 do
    []
  end

  def run_for_devices(query, %Organization{id: organization_id}) when byte_size(query) < 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name, 1.0::float AS score
            FROM devices
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name, 0.5::float AS score
            FROM devices
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) d ORDER BY id, score DESC)
      ) a
      ORDER BY score DESC
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, organization_id])
    to_json(result, "device")
  end

  def run_for_devices(query, %Organization{id: organization_id}) when byte_size(query) >= 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
    (
      SELECT id, name, score
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM devices
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS d
      WHERE score > $3
    )
    ORDER BY score DESC
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, "device")
  end

  def run_for_labels(query, _organization) when byte_size(query) == 0 do
    []
  end

  def run_for_labels(query, %Organization{id: organization_id}) when byte_size(query) < 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name, 1.0::float AS score
            FROM labels
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name, 0.5::float AS score
            FROM labels
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) d ORDER BY id, score DESC)
      ) a
      ORDER BY score DESC
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, organization_id])
    to_json(result, "label")
  end

  def run_for_labels(query, %Organization{id: organization_id}) when byte_size(query) >= 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
    (
      SELECT id, name, score
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM labels
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS d
      WHERE score > $3
    )
    ORDER BY score DESC
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, "label")
  end

  def run_for_functions(query, _organization) when byte_size(query) == 0 do
    []
  end

  def run_for_functions(query, %Organization{id: organization_id}) when byte_size(query) < 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name, 1.0::float AS score
            FROM functions
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name, 0.5::float AS score
            FROM functions
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) d ORDER BY id, score DESC)
      ) a
      ORDER BY score DESC
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, organization_id])
    to_json(result, "function")
  end

  def run_for_functions(query, %Organization{id: organization_id}) when byte_size(query) >= 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
    (
      SELECT id, name, score
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM functions
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS d
      WHERE score > $3
    )
    ORDER BY score DESC
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, "function")
  end

  def run_for_hotspots(query, _page, _page_size, _column, _order) when byte_size(query) == 0 do
    %{}
  end

  # running for owner wallet address search
  def run_for_hotspots(query, page, page_size, column, order) when String.match?(query, ~r/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51,52}$/) do
    order_by = case [column, order] do
      [nil, nil] -> [desc: :name]
      _ -> [String.to_existing_atom(Helpers.order_with_nulls(order)), String.to_existing_atom(column)]
    end

    query = from h in Hotspot,
      select: %{
        hotspot_address: h.address,
        hotspot_name: h.name,
        long_city: h.long_city,
        short_state: h.short_state,
        short_country: h.short_country,
        status: h.status,
        longitude: h.lng,
        latitude: h.lat
      },
      where: h.owner == ^query,
      order_by: ^order_by

    query |> Repo.paginate(page: page, page_size: page_size)
  end

  def run_for_hotspots(query, page, page_size, column, order) when byte_size(query) >= 3 do
    order_by = case [column, order] do
      [nil, nil] -> [desc: :score]
      _ -> [{String.to_existing_atom(Helpers.order_with_nulls(order)), String.to_existing_atom(column)}, {:desc, :score}]
    end

    sub_query = from h in Hotspot,
      select: %{
        hotspot_address: h.address,
        hotspot_name: h.name,
        long_city: h.long_city,
        short_state: h.short_state,
        short_country: h.short_country,
        status: h.status,
        longitude: h.lng,
        latitude: h.lat,
        score: fragment("CASE WHEN SIMILARITY(? || ' ', ?) > SIMILARITY(? || ' ', ?) THEN SIMILARITY(? || ' ', ?) ELSE SIMILARITY(? || ' ', ?) END",
          h.name, ^query,
          h.long_city, ^query,
          h.name, ^query,
          h.long_city, ^query
        ),
        owner: h.owner
      }

    query = from d in subquery(sub_query), select: %{
      hotspot_address: d.hotspot_address,
      hotspot_name: d.hotspot_name,
      long_city: d.long_city,
      short_state: d.short_state,
      short_country: d.short_country,
      status: d.status,
      score: d.score,
      longitude: d.longitude,
      latitude: d.latitude
    },
    where: d.score > @sim_limit,
    order_by: ^order_by

    query |> Repo.paginate(page: page, page_size: page_size)
  end

  def run_for_channels_mobile(query, %Organization{id: _organization_id}) when byte_size(query) == 0 do
    []
  end

  def run_for_channels_mobile(query, %Organization{id: organization_id} = organization) when byte_size(query) < 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name, type, type_name, 1.0::float AS score
            FROM channels
            WHERE organization_id = $3 AND ((name ILIKE $1) OR (type_name ILIKE $1))
          )
          UNION
          (
            SELECT id, name, type, type_name, 0.5::float AS score
            FROM channels
            WHERE organization_id = $3 AND ((name ~* $2) OR (type_name ~* $2))
          )
        ) d ORDER BY id, score DESC)
      ) a
      ORDER BY score DESC
      LIMIT 25
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, organization_id])
    to_json(result, organization, "channel")
  end

  def run_for_channels_mobile(query, %Organization{id: organization_id} = organization) when byte_size(query) >= 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
    (
      SELECT id, name, type, type_name, name_score, type_score
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS name_score, SIMILARITY(type_name || ' ', $1) AS type_score
        FROM channels
        WHERE organization_id = $2
        ORDER BY name_score, type_score DESC
      ) AS d
      WHERE name_score > $3 OR type_score > $3
    )
    ORDER BY name_score, type_score DESC
    LIMIT 25
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, organization, "channel")
  end

  def run_for_devices_mobile(query, %Organization{id: _organization_id}) when byte_size(query) == 0 do
    []
  end

  def run_for_devices_mobile(query, %Organization{id: organization_id}) when byte_size(query) < 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name, dev_eui, frame_up, frame_down, 1.0::float AS score
            FROM devices
            WHERE organization_id = $3 AND ((name ILIKE $1) OR (dev_eui ILIKE $1))
          )
          UNION
          (
            SELECT id, name, dev_eui, frame_up, frame_down, 0.5::float AS score
            FROM devices
            WHERE organization_id = $3 AND ((name ~* $2) OR (dev_eui ~* $2))
          )
        ) d ORDER BY id, score DESC)
      ) a
      ORDER BY score DESC
      LIMIT 25
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, organization_id])
    to_json(result, "device")
  end

  def run_for_devices_mobile(query, %Organization{id: organization_id}) when byte_size(query) >= 3 do
    {:ok, organization_id} = Ecto.UUID.dump(organization_id)

    sql = """
    (
      SELECT id, name, dev_eui, frame_up, frame_down, name_score, dev_eui_score
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS name_score, SIMILARITY(dev_eui || ' ', $1) AS dev_eui_score
        FROM devices
        WHERE organization_id = $2
        ORDER BY name_score, dev_eui_score DESC
      ) AS d
      WHERE name_score > $3 OR dev_eui_score > $3
    )
    ORDER BY name_score, dev_eui_score DESC
    LIMIT 25
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, "device")
  end

  def to_json(%Postgrex.Result{rows: records}) do
    records |> Enum.map(&cast/1)
  end

  def to_json(%Postgrex.Result{rows: records}, current_organization, "channel") do
    records
    |> Enum.map(
      fn r ->
        {:ok, id} = Ecto.UUID.cast(Enum.at(r, 0))
        %{
          id: id,
          name: Enum.at(r, 1),
          type: Enum.at(r, 2),
          type_name: Enum.at(r, 3),
          number_devices: Flows.get_number_devices_in_flows_with_channel(current_organization, id)
        }
      end
    )
  end

  def to_json(%Postgrex.Result{rows: records}, "device") do
    records
    |> Enum.map(
      fn r ->
        {:ok, id} = Ecto.UUID.cast(Enum.at(r, 0))
        %{
          id: id,
          name: Enum.at(r, 1),
          dev_eui: Enum.at(r, 2),
          frame_up: Enum.at(r, 3),
          frame_down: Enum.at(r, 4)
        }
      end
    )
  end

  def to_json(%Postgrex.Result{rows: records}, _) do
    records
    |> Enum.map(
      fn r ->
        {:ok, id} = Ecto.UUID.cast(Enum.at(r, 0))
        %{
          id: id,
          name: Enum.at(r, 1),
        }
      end
    )
  end

  def cast(record) do
    {:ok, id} = Ecto.UUID.cast(Enum.at(record, 0))
    category =
      case Enum.at(record, 4) do
        "channels" -> "integrations"
        _ -> Enum.at(record, 4)
      end

    url = "/#{category}/#{id}"
    %{
      id: id,
      title: Enum.at(record, 1),
      description: Enum.at(record, 2),
      score: Enum.at(record, 3),
      category: category,
      url: url
    }
  end
end
