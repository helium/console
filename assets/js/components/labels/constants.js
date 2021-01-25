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

export const DEFAULT_SETTINGS = [
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME,
    description: ' a device joins via OTAA for the first time'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING,
    description: ' a device stops transmitting for '
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED,
    description: ' a device has been deleted'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING,
    description: ' an integration stops working'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT,
    description: ' an integration receives the first packet'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL,
    description: ' a downlink is unsuccessful'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED,
    description: ' an integration with devices is deleted'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED,
    description: ' an integration with devices is updated'
  }
];

export function determineValue (setting, stateValue) {
  if (setting.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING) {
    return (setting.value || (stateValue && stateValue) || "60");
  } else {
    return (setting.value || (stateValue && stateValue) || "1");
  }
}

export function determineTimeValueToShow (value) {
  if (parseInt(value) < 60) {
    return `${value} mins`;
  } else {
    return `${(parseInt(value))/60} ${parseInt(value) === 60 ? 'hr' : 'hrs'}`;
  }
}