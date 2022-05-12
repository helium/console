export const getDownlinkKey = (channel) =>
  channel.downlink_token || `{:downlink_key}`;

export const getDownlinkUrl = (channel, downlinkKey) => {
  let downlinkUrl = `http://localhost:4000/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;

  if (process.env.SELF_HOSTED && window.env_domain !== "localhost:4000") {
    downlinkUrl = `https://${window.env_domain}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  }
  if (!process.env.SELF_HOSTED) {
    downlinkUrl = `https://${process.env.ENV_DOMAIN}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  }

  return downlinkUrl;
};
