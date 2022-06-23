const assert = require('assert');

function Decoder(bytes, port, uplink_info) {
  const DIGITAL_IN = 0
  const DIGITAL_OUT = 1
  const ANALOG_IN = 2
  const ANALOG_OUT = 3
  const GENERIC_SENSOR = 100
  const LUMINANCE = 101
  const PRESENCE = 102
  const TEMPERATURE = 103
  const HUMIDITY = 104
  const ACCELEROMETER = 113
  const BAROMETER = 115
  const VOLTAGE = 116
  const CURRENT = 117
  const FREQUENCY = 118
  const PERCENTAGE = 120
  const ALTITUDE = 121
  const CONCENTRATION = 125
  const POWER = 128
  const DISTANCE = 130
  const ENERGY = 131
  const DIRECTION = 132
  const GYROMETER = 134
  const COLOUR = 135
  const GPS = 136
  const SWITCH = 142

  const parseBytes = (bytes, acc) => {
    if (bytes.length == 0) return acc
    if (bytes[0] > 99) {
      return "LPP reserved channel"
    }

    if (bytes[1] == DIGITAL_IN && bytes.length >= 3) {
      const value = bytes[2]
      const nextBytes = bytes.slice(3)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: DIGITAL_IN,
          value,
          name: "digital_in",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == DIGITAL_OUT && bytes.length >= 3) {
      const value = bytes[2]
      const nextBytes = bytes.slice(3)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: DIGITAL_OUT,
          value,
          name: "digital_out",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == ANALOG_IN && bytes.length >= 4) {
      const value = (bytes[2] << 8 | bytes[3]) << 16 >> 16
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: ANALOG_IN,
          value: value / 100,
          name: "analog_in",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == ANALOG_OUT && bytes.length >= 4) {
      const value = (bytes[2] << 8 | bytes[3]) << 16 >> 16
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: ANALOG_OUT,
          value: value / 100,
          name: "analog_out",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == GENERIC_SENSOR && bytes.length >= 6) {
      const value = (((bytes[2] << 24 | bytes[3] << 16) | bytes[4] << 8) | bytes[5]) >>> 0
      const nextBytes = bytes.slice(6)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: GENERIC_SENSOR,
          value: value / 100,
          name: "generic_sensor",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == LUMINANCE && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: LUMINANCE,
          value,
          name: "luminance",
          unit: "lux",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == PRESENCE && bytes.length >= 3) {
      const value = bytes[2]
      const nextBytes = bytes.slice(3)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: PRESENCE,
          value,
          name: "presence",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == TEMPERATURE && bytes.length >= 4) {
      const value = (bytes[2] << 8 | bytes[3]) << 16 >> 16
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: TEMPERATURE,
          value: value / 10,
          unit: "celsius",
          name: "temperature",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == HUMIDITY && bytes.length >= 3) {
      const value = bytes[2]
      const nextBytes = bytes.slice(3)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: HUMIDITY,
          value: value / 2,
          unit: "percent",
          name: "humidity",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == ACCELEROMETER && bytes.length >= 8) {
      const x = (bytes[2] << 8 | bytes[3]) << 16 >> 16
      const y = (bytes[4] << 8 | bytes[5]) << 16 >> 16
      const z = (bytes[6] << 8 | bytes[7]) << 16 >> 16
      const nextBytes = bytes.slice(8)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: ACCELEROMETER,
          value: { x: x/1000, y: y/1000, z: z/1000},
          unit: "G",
          name: "accelerometer",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == BAROMETER && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: BAROMETER,
          value: value / 10,
          unit: "hPa",
          name: "barometer",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == VOLTAGE && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: VOLTAGE,
          value: value / 100,
          unit: "V",
          name: "voltage",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == CURRENT && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: CURRENT,
          value: value / 1000,
          unit: "A",
          name: "current",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == FREQUENCY && bytes.length >= 6) {
      const value = (((bytes[2] << 24 | bytes[3] << 16) | bytes[4] << 8) | bytes[5]) >>> 0
      const nextBytes = bytes.slice(6)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: FREQUENCY,
          value,
          unit: "Hz",
          name: "frequency",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == PERCENTAGE && bytes.length >= 3) {
      const value = bytes[2]
      const nextBytes = bytes.slice(3)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: PERCENTAGE,
          value,
          unit: "%",
          name: "percentage",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == ALTITUDE && bytes.length >= 4) {
      const value = (bytes[2] << 8 | bytes[3]) << 16 >> 16
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: ALTITUDE,
          value,
          unit: "m",
          name: "altitude",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == CONCENTRATION && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: CONCENTRATION,
          value,
          unit: "PPM",
          name: "concentration",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == POWER && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: POWER,
          value,
          unit: "W",
          name: "power",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == DISTANCE && bytes.length >= 6) {
      const value = (((bytes[2] << 24 | bytes[3] << 16) | bytes[4] << 8) | bytes[5]) >>> 0
      const nextBytes = bytes.slice(6)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: DISTANCE,
          value: value / 1000,
          unit: "m",
          name: "distance",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == ENERGY && bytes.length >= 6) {
      const value = (((bytes[2] << 24 | bytes[3] << 16) | bytes[4] << 8) | bytes[5]) >>> 0
      const nextBytes = bytes.slice(6)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: ENERGY,
          value: value / 1000,
          unit: "kWh",
          name: "energy",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == DIRECTION && bytes.length >= 4) {
      const value = bytes[2] << 8 | bytes[3]
      const nextBytes = bytes.slice(4)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: DIRECTION,
          value,
          unit: "º",
          name: "direction",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == GYROMETER && bytes.length >= 8) {
      const x = (bytes[2] << 8 | bytes[3]) << 16 >> 16
      const y = (bytes[4] << 8 | bytes[5]) << 16 >> 16
      const z = (bytes[6] << 8 | bytes[7]) << 16 >> 16
      const nextBytes = bytes.slice(8)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: GYROMETER,
          value: { x: x/100, y: y/100, z: z/100},
          unit: "°/s",
          name: "gyrometer",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == COLOUR && bytes.length >= 5) {
      const r = bytes[2]
      const g = bytes[3]
      const b = bytes[4]
      const nextBytes = bytes.slice(5)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: COLOUR,
          value: { r, g, b },
          name: "colour",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == GPS && bytes.length >= 11) {
      const lat = ((bytes[2] << 16 | bytes[3] << 8) | bytes[4]) << 8 >> 8
      const lon = ((bytes[5] << 16 | bytes[6] << 8) | bytes[7]) << 8 >> 8
      const alt = ((bytes[8] << 16 | bytes[9] << 8) | bytes[10]) << 8 >> 8
      const nextBytes = bytes.slice(11)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: GPS,
          value: { latitude: lat/10000, longitude: lon/10000, altitude: alt/100},
          name: "gps",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    if (bytes[1] == SWITCH && bytes.length >= 3) {
      const value = bytes[2]
      const nextBytes = bytes.slice(3)
      return parseBytes(
        nextBytes,
        acc.concat({
          channel: bytes[0],
          type: SWITCH,
          value,
          name: "switch",
          last: nextBytes.length == 0 ? true : undefined
        })
      )
    }

    return "LPP decoder failure"
  }

  return parseBytes(bytes, [])
}

describe('Non valid port payload test', () => {
  it('Should fail when channel is over 99', function () {
    assert.equal(
      Decoder([0xFF]),
      "LPP reserved channel"
    )
  })

  it('Should fail when channel not found', function () {
    assert.equal(
      Decoder([0x00, 0xFF]),
      "LPP decoder failure"
    )
  })

  it('Should fail when not enough bytes after valid channel', function () {
    assert.equal(
      Decoder([0x00, 0x00]),
      "LPP decoder failure"
    )
  })

  it('Should decode DIGITAL_IN type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x00, 0x0F]),
      [{
        channel: 0,
        last: true,
        name: 'digital_in',
        type: 0,
        value: 15
      }]
    )
  })

  it('Should decode DIGITAL_OUT type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x01, 0x0F]),
      [{
        channel: 0,
        last: true,
        name: 'digital_out',
        type: 1,
        value: 15
      }]
    )
  })

  it('Should decode ANALOG_IN type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x02, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'analog_in',
        type: 2,
        value: -2.56
      }]
    )
  })

  it('Should decode ANALOG_OUT type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x03, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'analog_out',
        type: 3,
        value: -2.56
      }]
    )
  })

  it('Should decode GENERIC_SENSOR type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x64, 0xFF, 0x00, 0x00, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'generic_sensor',
        type: 100,
        value: 42781900.8
      }]
    )
  })

  it('Should decode LUMINANCE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x65, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'luminance',
        type: 101,
        unit: "lux",
        value: 65280
      }]
    )
  })

  it('Should decode PRESENCE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x66, 0xFF]),
      [{
        channel: 0,
        last: true,
        name: 'presence',
        type: 102,
        value: 255
      }]
    )
  })

  it('Should decode TEMPERATURE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x03, 0x67, 0x01, 0x10, 0x05, 0x67, 0x00, 0xFF]),
      [{
        channel: 3,
        name: 'temperature',
        type: 103,
        unit: 'celsius',
        value: 27.2,
        last: undefined
      }, {
        channel: 5,
        name: 'temperature',
        type: 103,
        unit: 'celsius',
        value: 25.5,
        last: true
      }]
    )
  })

  it('Should decode HUMIDITY type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x68, 0xFF]),
      [{
        channel: 0,
        last: true,
        name: 'humidity',
        type: 104,
        unit: 'percent',
        value: 127.5
      }]
    )
  })

  it('Should decode ACCELEROMETER type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x06, 0x71, 0x04, 0xD2, 0xFB, 0x2E, 0x00, 0x00]),
      [{
        channel: 6,
        last: true,
        name: 'accelerometer',
        type: 113,
        unit: 'G',
        "value": {
          x: 1.234,
          y: -1.234,
          z: 0
        }
      }]
    )
  })

  it('Should decode BAROMETER type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x73, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'barometer',
        type: 115,
        unit: 'hPa',
        value: 6528
      }]
    )
  })

  it('Should decode VOLTAGE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x74, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'voltage',
        type: 116,
        unit: 'V',
        value: 652.8
      }]
    )
  })

  it('Should decode CURRENT type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x75, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'current',
        type: 117,
        unit: 'A',
        value: 65.28
      }]
    )
  })

  it('Should decode FREQUENCY type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x76, 0xFF, 0x00, 0x00, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'frequency',
        type: 118,
        unit: 'Hz',
        value: 4278190080
      }]
    )
  })

  it('Should decode PERCENTAGE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x78, 0xFF]),
      [{
        channel: 0,
        last: true,
        name: 'percentage',
        type: 120,
        unit: '%',
        value: 255
      }]
    )
  })

  it('Should decode ALTITUDE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x79, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'altitude',
        type: 121,
        unit: 'm',
        value: -256
      }]
    )
  })

  it('Should decode CONCENTRATION type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x7D, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'concentration',
        type: 125,
        unit: 'PPM',
        value: 65280
      }]
    )
  })

  it('Should decode POWER type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x80, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'power',
        type: 128,
        unit: 'W',
        value: 65280
      }]
    )
  })

  it('Should decode DISTANCE type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x82, 0xFF, 0x00, 0x00, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'distance',
        type: 130,
        unit: 'm',
        value: 4278190.08
      }]
    )
  })

  it('Should decode ENERGY type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x83, 0xFF, 0x00, 0x00, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'energy',
        type: 131,
        unit: 'kWh',
        value: 4278190.08
      }]
    )
  })

  it('Should decode DIRECTION type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x84, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'direction',
        type: 132,
        unit: 'º',
        value: 65280
      }]
    )
  })

  it('Should decode GYROMETER type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x86, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'gyrometer',
        type: 134,
        unit: '°/s',
        value: {
          x: -2.56,
          y: -2.56,
          z: -2.56
        }
      }]
    )
  })

  it('Should decode COLOUR type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x87, 0xFF, 0x00, 0x00]),
      [{
        channel: 0,
        last: true,
        name: 'colour',
        type: 135,
        value: {
          r: 255,
          g: 0,
          b: 0
        }
      }]
    )
  })

  it('Should decode GPS type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x06, 0x88, 0x04, 0xD2, 0xFB, 0x2E, 0x00, 0x00, 0xFF, 0x00, 0x00]),
      [{
        channel: 6,
        last: true,
        name: 'gps',
        type: 136,
        value: {
          altitude: -655.36,
          latitude: 31.6155,
          longitude: 301.4656
        }
      }]
    )
  })

  it('Should decode SWITCH type payloads properly', function() {
    assert.deepEqual(
      Decoder([0x00, 0x8E, 0xFF]),
      [{
        channel: 0,
        last: true,
        name: 'switch',
        type: 142,
        value: 255
      }]
    )
  })

})
