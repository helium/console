import { schema, normalize } from 'normalizr'

const event = new schema.Entity('events')

const channel = new schema.Entity('channels', {
  events: [ event ]
})

export const channelsSchema = [channel]
export const channelSchema = channel

export const normalizeChannels = (channelsData) => {
  return normalize(channelsData, channelsSchema).entities
}

export const normalizeChannel = (channelData) => {
  return normalize(channelData, channelSchema).entities
}

