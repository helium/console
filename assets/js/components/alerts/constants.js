export const NOTIFICATION_SETTINGS_KEYS = {
  DEVICE_JOIN_OTAA_FIRST_TIME: 'device_join_otaa_first_time',
  DEVICE_STOPS_TRANSMITTING: 'device_stops_transmitting',
  DEVICE_DELETED: 'device_deleted',
  INTEGRATION_STOPS_WORKING: 'integration_stops_working',
  INTEGRATION_RECEIVES_FIRST_EVENT: 'integration_receives_first_event',
  DOWNLINK_UNSUCCESSFUL: 'downlink_unsuccessful',
  INTEGRATION_WITH_DEVICES_DELETED: 'integration_with_devices_deleted',
  INTEGRATION_WITH_DEVICES_UPDATED: 'integration_with_devices_updated'
}


export const DEFAULT_SETTINGS = {
  'device/group': [
    {
      key: NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL,
      description: ' a downlink is unsuccessful',
      hasValue: false
    },
    {
      key: NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME,
      description: ' a device joins via OTAA for the first time',
      hasValue: false
    },
    {
      key: NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING,
      description: ' a device stops transmitting for ',
      hasValue: true
    },
    {
      key: NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED,
      description: ' a device has been deleted',
      hasValue: false
    }
  ],
  'integration': [
    {
      key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED,
      description: ' an integration with devices is deleted',
      hasValue: false
    },
    {
      key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED,
      description: ' an integration with devices is updated',
      hasValue: false
    },
    {
      key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING,
      description: ' an integration stops working',
      hasValue: false
    },
    {
      key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT,
      description: ' an integration receives the first packet',
      hasValue: false
    }
  ],
  'function': [

  ]
}

export function determineTimeValueToShow (value) {
  let timeValue = value === "0" ? 60 : parseInt(value);
  if (timeValue < 60) {
    return `${timeValue} mins`;
  } else {
    return `${timeValue/60} ${timeValue === 60 ? 'hr' : 'hrs'}`;
  }
}

export const ALERT_TYPES = {
  'device/group': {
    name: 'Device/Group',
    color: '#2C79EE'
  },
  'function': {
    name: 'Function',
    color: '#9F59F7'
  },
  'integration': {
    name: 'Integration',
    color: '#12CB9E'
  }
}