defmodule Console.Search do
  alias Console.Teams.Team
  @sim_limit 0.05

  def run(query, _team) when byte_size(query) == 0 do
    []
  end

  # When queries are 3+ characters, we can use a more elegant search with
  # trigrams, but for searches of 1-2 characters, we have to kind of hack it
  def run(query, %Team{id: team_id}) when byte_size(query) < 3 do
    {:ok, team_id} = Ecto.UUID.dump(team_id)

    sql = """
      SELECT * FROM
      (
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, mac AS description, 1.0::float AS score, 'devices' AS category
            FROM devices
            WHERE team_id = $3 AND (name ILIKE $1 OR mac ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, mac AS description, 0.5::float AS score, 'devices' AS category
            FROM devices
            WHERE team_id = $3 AND (name ~* $2 OR mac ~* $2)
          )
        ) d ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, mac AS description, 1.0::float AS score, 'gateways' AS category
            FROM gateways
            WHERE team_id = $3 AND (name ILIKE $1 OR mac ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, mac AS description, 0.5::float AS score, 'gateways' AS category
            FROM gateways
            WHERE team_id = $3 AND (name ~* $2 OR mac ~* $2)
          )
        ) g ORDER BY id, score DESC)
        UNION
        (SELECT DISTINCT on(id) * FROM
        (
          (
            SELECT id, name AS title, type AS description, 1.0::float AS score, 'channels' AS category
            FROM channels
            WHERE team_id = $3 AND (name ILIKE $1 OR type ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, type AS description, 0.5::float AS score, 'channels' AS category
            FROM channels
            WHERE team_id = $3 AND (name ~* $2 OR type ~* $2)
          )
        ) c
          ORDER BY id, score DESC
        )
      ) a
      ORDER BY score DESC
      LIMIT 10
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, ["#{query}%", query, team_id])
    to_json(result)
  end

  def run(query, %Team{id: team_id}) when byte_size(query) >= 3 do
    {:ok, team_id} = Ecto.UUID.dump(team_id)

    sql = """
    (
      SELECT id, name AS title, mac AS description, score, 'devices' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ' || mac, $1) AS score
        FROM devices
        WHERE team_id = $2
        ORDER BY score DESC
      ) AS d
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, mac AS description, score, 'gateways' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ' || mac, $1) AS score
        FROM gateways
        WHERE team_id = $2
        ORDER BY score DESC
      ) AS g
      WHERE score > $3
    )
    UNION
    (
      SELECT id, name AS title, type AS description, score, 'channels' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ' || type, $1) AS score
        FROM channels
        WHERE team_id = $2
        ORDER BY score DESC
      ) AS c
      WHERE score > $3
    )
    ORDER BY score DESC
    LIMIT 10
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, team_id, @sim_limit])
    to_json(result)
  end

  def to_json(%Postgrex.Result{rows: records}) do
    records |> Enum.map(&cast/1)
  end

  def cast(record) do
    {:ok, id} = Ecto.UUID.cast(Enum.at(record, 0))
    category = Enum.at(record, 4)
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
