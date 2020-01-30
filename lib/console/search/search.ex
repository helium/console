defmodule Console.Search do
  alias Console.Organizations.Organization
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
            SELECT id, name AS title, mac AS description, 1.0::float AS score, 'devices' AS category
            FROM devices
            WHERE organization_id = $3 AND (name ILIKE $1 OR mac ILIKE $1)
          )
          UNION
          (
            SELECT id, name AS title, mac AS description, 0.5::float AS score, 'devices' AS category
            FROM devices
            WHERE organization_id = $3 AND (name ~* $2 OR mac ~* $2)
          )
        ) d ORDER BY id, score DESC)
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
        ) c
          ORDER BY id, score DESC
        )
      ) a
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
      SELECT id, name AS title, mac AS description, score, 'devices' AS category
      FROM (
        SELECT *, SIMILARITY(name || ' ' || mac, $1) AS score
        FROM devices
        WHERE organization_id = $2
        ORDER BY score DESC
      ) AS d
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
      ) AS c
      WHERE score > $3
    )
    ORDER BY score DESC
    LIMIT 5
    """

    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [query, organization_id, @sim_limit])
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
