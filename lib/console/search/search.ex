defmodule Console.Search do
  alias Console.Organizations.Organization
  @sim_limit 0.05

  # When query is empty, just return an array
  def run(query, _organization) when byte_size(query) == 0 do
    []
  end

  def run_for_labels(query, _organization) when byte_size(query) == 0 do
    []
  end

  def run_for_devices(query, _organization) when byte_size(query) == 0 do
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
            SELECT id, name AS title, creator AS description, 1.0::float AS score, 'labels' AS category
            FROM labels
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, creator AS description, 0.5::float AS score, 'labels' AS category
            FROM labels
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) c ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, type AS description, 1.0::float AS score, 'functions' AS category
            FROM functions
            WHERE organization_id = $3 AND (name ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, type AS description, 0.5::float AS score, 'functions' AS category
            FROM functions
            WHERE organization_id = $3 AND (name ~* $2)
          )
        ) d ORDER BY id, score DESC)
      ) e
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
        SELECT *, SIMILARITY(name || ' ' || dev_eui, $1) AS score
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
        SELECT *, SIMILARITY(name || ' ' || type_name, $1) AS score
        FROM channels
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS b
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, creator AS description, score, 'labels' AS category
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
      SELECT id, name AS title, type AS description, score, 'functions' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ', $1) AS score
        FROM functions
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
      LIMIT 5
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
    LIMIT 5
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, "device")
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
      LIMIT 5
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
    LIMIT 5
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
    to_json(result, "label")
  end

  def to_json(%Postgrex.Result{rows: records}) do
    records |> Enum.map(&cast/1)
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
