import { schema, normalize } from 'normalizr'

const membership = new schema.Entity('memberships')

const team = new schema.Entity('teams', {
  memberships: [ membership ]
})

export const teamsSchema = [team]
export const teamSchema = team

export const normalizeTeams = (teamsData) => {
  return normalize(teamsData, teamsSchema).entities
}

export const normalizeTeam = (teamData) => {
  return normalize(teamData, teamSchema).entities
}

