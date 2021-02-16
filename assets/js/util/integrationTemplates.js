export const defaultPayload = {
    "app_eui": "3655731B237B9BA8",
    "dc": {
        "balance": 967819,
        "nonce": 4
    },
    "dev_eui": "ED9196B2424BF383",
    "devaddr": "07040048",
    "downlink_url": "https://staging-console.helium.com/api/v1/down/46fe16d8-bb37-4fc7-8f66-d722aa86a995/L-RZrP2oxYQ150phzndQ-O5LKlXjRb17/91c9b41c-acb6-4887-93a1-dea80d13e92f",
    "fcnt": 412,
    "hotspots": [
        {
            "channel": 9,
            "frequency": 904.0999755859375,
            "id": "11D86CyMMt685XcsddPtaChWr3qz2UxDyhGG5EUeZbwqemxjBMb",
            "lat": 38.90166995231145,
            "long": -121.0663012467163,
            "name": "fancy-wood-pee",
            "reported_at": 1606262019,
            "rssi": -97,
            "snr": 12.800000190734863,
            "spreading": "SF9BW125",
            "status": "success"
        },
        {
            "channel": 9,
            "frequency": 904.0999755859375,
            "id": "11D86CyMMt685XcsddPtaChWr3qz2UxDyhGG5EUeZbwqemxjBMb",
            "lat": 32.90166995231145,
            "long": -118.0663012467163,
            "name": "cool-rusty-willow",
            "reported_at": 1606262019,
            "rssi": -93,
            "snr": 12.300000190734863,
            "spreading": "SF9BW125",
            "status": "success"
        }
    ],
    "id": "91c9b41c-acb6-4887-93a1-dea80d13e92f",
    "metadata": {
        "labels": [
            {
                "id": "b6374794-4c46-43a0-99ff-a967aa75c526",
                "name": "Integration_1",
                "organization_id": "ae2f4a57-f3db-4ca2-bca3-aadb79c326b8"
            },
            {
                "id": "071a45f3-19f0-4308-941c-51a68a02419d",
                "name": "Integration_2",
                "organization_id": "ae2f4a57-f3db-4ca2-bca3-aadb79c326b8"
            }
        ],
        "organization_id": "ae2f4a57-f3db-4ca2-bca3-aadb79c326b8"
    },
    "name": "Device_1",
    "payload": "base64 encoded payload",
    "port": 1,
    "reported_at": 1606262019
}

export const browanPayload = {
    "app_eui": "58A0CB0000210000",
    "dc": {
        "balance": 2995502,
        "nonce": 3
    },
    "decoded": {
        "payload": {
            "accuracy": 4,
            "battery": 3.7,
            "battery_percent": 13.333333333333334,
            "button": false,
            "gns_error": false,
            "gns_fix": true,
            "latitude": 0,
            "longitude": 0,
            "moving": false,
            "temperature": 23
        },
        "status": "success"
    },
    "dev_eui": "58A0CB0000202323",
    "devaddr": "01040048",
    "downlink_url": "https://staging-console.helium.com/api/v1/down/5ad2a56b-bd1f-4c9e-bf16-cd54e2d692be/jVQaJ1yfdbOqYFwEar_14_zWXVOKpezQ/5e651b66-1bb1-46dd-b0e5-d72356c0f5e3",
    "fcnt": 114,
    "hotspots": [
        {
            "channel": 10,
            "frequency": 904.2999877929688,
            "id": "112JgS5gMC5xvNoiW5Q9Ewtc3FxqQ43JNp8S91h3fxpqgDG7TjSj",
            "lat": 41.41539975863371,
            "long": -122.38450025081205,
            "name": "joyful-gingerbread-ant",
            "reported_at": 1606864045,
            "rssi": -72,
            "snr": 6,
            "spreading": "SF10BW125",
            "status": "success"
        }
    ],
    "id": "5e651b66-1bb1-46dd-b0e5-d72356c0f5e3",
    "metadata": {
        "labels": [
            {
                "id": "03df7acc-2506-4455-a773-f26b74745914",
                "name": "Tab",
                "organization_id": "847e51db-25bd-4ff5-8fc3-33b459a68a22"
            }
        ],
        "organization_id": "847e51db-25bd-4ff5-8fc3-33b459a68a22"
    },
    "name": "Tab 666-1",
    "payload": "CCw3AAAAAAAAAAA=",
    "payload_size": 11,
    "port": 136,
    "reported_at": 1606864045
}

export const cayennePayload = {
      "app_eui": "3655731B237B9BA8",
      "dc": {
        "balance": 964794,
        "nonce": 4
      },
      "decoded": {
        "payload": [
          {
            "channel": 1,
            "name": "gps",
            "type": 136,
            "value": {
              "altitude": 79,
              "latitude": 37.9017,
              "longitude": -122.0686
            }
          },
          {
            "channel": 2,
            "name": "temperature",
            "type": 103,
            "unit": "celcius",
            "value": 50
          },
          {
            "channel": 3,
            "last": true,
            "name": "accelerometer",
            "type": 113,
            "unit": "G",
            "value": {
              "x": 1,
              "y": 2,
              "z": 3
            }
          }
        ],
        "status": "success"
      },
      "dev_eui": "ED9196B2424BF383",
      "devaddr": "13040048",
      "downlink_url": "https://staging-console.helium.com/api/v1/down/76c46dea-45dd-4d47-924a-67a7ec234e2b/yQIQUAqE_-rpS18pxjUbIUYNBl3kf6oi/91c9b41c-acb6-4887-93a1-dea80d13e92f",
      "fcnt": 87,
      "hotspots": [
        {
          "channel": 12,
          "frequency": 904.7000122070312,
          "id": "117ei8DWNjSFuLgg3BrtTNSTi2tt14LRUFgt1Bk2kYqkHWrg82c",
          "lat": 37.900364668729985,
          "long": -122.07205324641957,
          "name": "square-goldenrod-gorilla",
          "reported_at": 1606869315,
          "rssi": -31,
          "snr": 12.199999809265137,
          "spreading": "SF9BW125",
          "status": "success"
        }
      ],
      "id": "91c9b41c-acb6-4887-93a1-dea80d13e92f",
      "metadata": {
        "labels": [
          {
            "id": "13f1e65c-f888-41e9-98b8-810f07c04f9d",
            "name": "Pipedream Template Testing",
            "organization_id": "ae2f4a57-f4db-4ca2-bca3-aadb79f326b8"
          }
        ],
        "organization_id": "ae2f4a57-f4db-4ca2-bca3-aadb79f326b8"
      },
      "name": "Home Disco DevKit",
      "payload": "AYgFyIntX7IAHtwCZwH0A3ED6AfQC7g=",
      "payload_size": 23,
      "port": 1,
      "reported_at": 1606869315
    }

export const defaultTemplate = '{\n  "id": "{{id}}",\n  "name": "{{name}}",\n  "app_eui": "{{app_eui}}",\n  "dev_eui": "{{dev_eui}}",\n  "devaddr": "{{devaddr}}",\n  "downlink_url": "{{downlink_url}}",\n  "fcnt": "{{fcnt}}",\n  "port": "{{port}}",\n  "payload": "{{payload}}",\n  "reported_at": "{{reported_at}}"\n}'
export const browanTemplate = '{\n  "device": "{{id}}",\n  {{#decoded}}{{#payload}}\n  "battery": {{battery_percent}},\n  "latitude": {{latitude}},\n  "longitude": {{longitude}},\n  "temperature": {{temperature}}\n  {{/payload}}{{/decoded}}\n}'
export const cayenneTemplate = '{\n  {{#decoded}}{{#payload}}\n    {{^value.altitude}}\n      {{#value.x}}\n        "{{name}}_x_{{channel}}": "{{value.x}}",\n        "{{name}}_y_{{channel}}": "{{value.y}}",\n        "{{name}}_z_{{channel}}": "{{value.z}}"{{^last}},{{/last}}\n      {{/value.x}}\n      {{^value.x}}\n        "{{name}}__{{channel}}":"{{value}}"{{^last}},{{/last}}\n      {{/value.x}}\n    {{/value.altitude}}\n    {{^value.x}}\n      {{#value.altitude}}\n        "altitude": "{{value.altitude}}",\n        "latitude": "{{value.latitude}}",\n        "longitude": "{{value.longitude}}"{{^last}},{{/last}}\n      {{/value.altitude}}\n    {{/value.x}}\n  {{/payload}}{{/decoded}}\n}'
