import { schema, normalize } from 'normalizr'

const team = new schema.Entity('teams')

export const teamsSchema = [team]
export const teamSchema = team

export const normalizeTeams = (teamsData) => {
  return normalize(teamsData, teamsSchema).entities
}

export const normalizeTeam = (teamData) => {
  return normalize(teamData, teamSchema).entities
}

