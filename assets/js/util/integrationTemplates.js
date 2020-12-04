export const defaultPayload = {
    "id": "5e651b66-1bb1-46dd-b0e5-d72356c0f5e3",
    "name": "name 1",
    "dev_eui": "58A0CB0000202323",
    "app_eui": "app_eui",
    "metadata": {},
    "fcnt": 2,
    "reported_at": 123,
    "payload": "base64 encoded payload",
    "payload_size": 22,
    "port": 1,
    "devaddr": "devaddr",
    "hotspots": [
        {
            "id": "hotspot_id",
            "name": "hotspot name",
            "reported_at": 123,
            "status": "success | error",
            "rssi": -30,
            "snr": 0.2,
            "spreading": "SF9BW125",
            "frequency": 923.3,
            "channel": 12,
            "lat": 37.00001962582851,
            "long": -120.9000053210367
        }
    ],
    "dc" : {
        "balance": 3000,
        "nonce": 2
    }
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

export const defaultTemplate = '{\n  "id": "{{id}}",\n  "name": "{{name}}",\n  "dev_eui": "{{dev_eui}}"\n}'
export const browanTemplate = '{\n  "device": "{{id}}",\n  {{#decoded}}{{#payload}}\n  "battery": {{battery_percent}},\n  "latitude": {{latitude}},\n  "longitude": {{longitude}},\n  "temperature": {{temperature}}\n  {{/payload}}{{/decoded}}\n}'
export const cayenneTemplate = '{\n  {{#decoded}}{{#payload}}\n    {{^value.altitude}}\n      {{#value.x}}\n        "{{name}}_x": "{{value.x}}",\n        "{{name}}_y": "{{value.y}}",\n        "{{name}}_z": "{{value.z}}"{{^last}},{{/last}}\n      {{/value.x}}\n      {{^value.x}}\n        "{{name}}":"{{value}}"{{^last}},{{/last}}\n      {{/value.x}}\n    {{/value.altitude}}\n    {{^value.x}}\n      {{#value.altitude}}\n        "altitude": "{{value.altitude}}",\n        "latitude": "{{value.latitude}}",\n        "longitude": "{{value.longitude}}"{{^last}},{{/last}}\n      {{/value.altitude}}\n    {{/value.x}}\n  {{/payload}}{{/decoded}}\n}'
