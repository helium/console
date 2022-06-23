const assert = require('assert');

function Decoder(bytes, port, uplink_info) {
  if (port == 136 && bytes.length == 11) {
    const positionLat = ((bytes[6] << 24 | bytes[5] << 16) | bytes[4] << 8) | bytes[3]

    const accuracy = Math.trunc(Math.pow((bytes[10] >> 5) + 2, 2))
    bytes[10] &= 0x1f;
    if ((bytes[10] & 0x10) !== 0) {
      bytes[10] |= 0xe0;
    }
    const positionLon = ((bytes[10] << 24 | bytes[9] << 16) | bytes[8] << 8) | bytes[7]

    return {
      gns_error: (bytes[0] & 0x10) >>> 4 == 1,
      gns_fix: (bytes[0] & 0x08) >>> 3 == 1,
      moving: (bytes[0] & 0x02) >>> 1 == 1,
      button: (bytes[0] & 0x01) == 1,
      battery_percent: 100 * ((bytes[1] >>> 4) / 15),
      battery: ((bytes[1] & 0x0f) + 25) / 10,
      temperature: bytes[2] & 0x7f - 32,
      latitude: positionLat / 1000000,
      longitude: positionLon / 1000000,
      accuracy
    }
  }

  if (port == 204 && bytes[0] == 0 && bytes[3] == 1 && bytes[6] == 2) {
    return {
      update_interval_moving: (bytes[2] << 8) | bytes[1],
      keepalive_interval_stationary: (bytes[5] << 8) | bytes[4],
      gsensor_timeout_moving: (bytes[8] << 8) | bytes[7]
    }
  }

  return "Invalid arguments passed to decoder"
}

describe('Non valid port payload test', () => {
  it('Should fail when port is invalid', function () {
    assert.equal(
      Decoder([0x00, 0x6d, 0x3d, 0x52, 0xff, 0x8e, 0x01, 0x34, 0xe1, 0x36, 0x5b], 1),
      "Invalid arguments passed to decoder"
    )
  })
})

describe('Port 136 payload test', () => {
  it('Should return correct decoded payload', function () {
    assert.deepEqual(
      Decoder([0x00, 0x6d, 0x3d, 0x52, 0xff, 0x8e, 0x01, 0x34, 0xe1, 0x36, 0x5b], 136),
      {
        accuracy: 16,
        battery: 3.8,
        battery_percent: 40,
        button: false,
        gns_error: false,
        gns_fix: false,
        latitude: 26.14869,
        longitude: -80.289484,
        moving: false,
        temperature: 29
      }
    )
  })
})

describe('Port 204 payload test', () => {
  it('Should return correct decoded payload', function () {
    assert.deepEqual(
      Decoder([0x00, 0x00, 0xff, 0x01, 0xff, 0xff, 0x02, 0xff, 0x00, 0x36, 0x5b], 204),
      {
        gsensor_timeout_moving: 255,
        keepalive_interval_stationary: 65535,
        update_interval_moving: 65280
      }
    )
  })
})
