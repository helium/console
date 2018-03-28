import { schema, normalize } from 'normalizr'

const event = new schema.Entity('events')

const device = new schema.Entity('devices', {
  events: [ event ]
})

export const devicesSchema = [device]
export const deviceSchema = device

export const normalizeDevices = (devicesData) => {
  const normalizedData = normalize(devicesData, devicesSchema)
  return normalizedData.entities
}

export const normalizeDevice = (deviceData) => {
  const normalizedData = normalize(deviceData, deviceSchema)
  return normalizedData.entities
}

