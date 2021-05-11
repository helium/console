export const downlinkMacMap = {
  link_adr_req: [
    {
      title: "Data Rate",
      key: "data_rate",
    },
    {
      title: "TX Power",
      key: "tx_power",
    },
    {
      title: "Channel Mask",
      key: "channel_mask",
    },
    {
      title: "Channel Mask Control",
      key: "channel_mask_control",
    },
    {
      title: "No. of Transmissions",
      key: "number_of_transmissions",
    },
  ],
  link_check_ans: [
    {
      title: "Gateway Count",
      key: "gateway_count",
    },
    {
      title: "Margin",
      key: "margin",
    },
  ],
  duty_cycle_req: [
    {
      title: "Max. Duty Cycle",
      key: "max_duty_cycle",
    },
  ],
  rx_param_setup_req: [
    {
      title: "RX1 Data Rate Offset",
      key: "rx1_data_rate_offset",
    },
    {
      title: "RX2 Data Rate",
      key: "rx2_data_rate",
    },
    {
      title: "Frequency",
      key: "frequency",
    },
  ],
  new_channel_req: [
    {
      title: "Channel Index",
      key: "channel_index",
    },
    {
      title: "Frequency",
      key: "frequency",
    },
    {
      title: "Max. Data Rate",
      key: "max_data_rate",
    },
    {
      title: "Min. Data Rate",
      key: "min_data_rate",
    },
  ],
  rx_timing_setup_req: [
    {
      title: "Delay",
      key: "delay",
    },
  ],
  tx_param_setup_req: [
    {
      title: "Downlink Dwell Time",
      key: "downlink_dwell_time",
    },
    {
      title: "Uplink Dwell Time",
      key: "uplink_dwell_time",
    },
    {
      title: "Max. Effective Isotropic Radiated Power",
      key: "max_effective_isotropic_radiated_power",
    },
  ],
  dl_channel_req: [
    {
      title: "Channel Index",
      key: "channel_index",
    },
    {
      title: "Frequency",
      key: "frequency",
    },
    {
      title: "Max. Data Rate",
      key: "max_data_rate",
    },
    {
      title: "Min. Data Rate",
      key: "min_data_rate",
    },
  ],
  device_time_ans: [
    {
      title: "Secs Elapsed Since Origin",
      key: "seconds_elapsed_since_origin",
    },
    {
      title: "GPS Epoch",
      key: "gps_epoch",
    },
  ],
};

export const uplinkMacMap = {
  link_adr_ans: [
    {
      title: "Power Ack",
      key: "power_ack",
    },
    {
      title: "Data Rate Ack",
      key: "data_rate_ack",
    },
    {
      title: "Channel Mask Ack",
      key: "channel_mask_ack",
    },
  ],
  rx_param_setup_ans: [
    {
      title: "RX1 Offset Ack",
      key: "rx1_offset_ack",
    },
    {
      title: "RX2 Data Rate Ack",
      key: "rx2_data_rate_ack",
    },
    {
      title: "Channel Ack",
      key: "channel_ack",
    },
  ],
  dev_status_ans: [
    {
      title: "Battery",
      key: "battery",
    },
    {
      title: "Margin",
      key: "margin",
    },
  ],
  new_channel_ans: [
    {
      title: "Data Rate OK",
      key: "data_rate_ok",
    },
    {
      title: "Channel Freq OK",
      key: "channel_freq_ok",
    },
  ],
  di_channel_ans: [
    {
      title: "Uplink Freq Exists",
      key: "uplink_freq_exists",
    },
    {
      title: "Channel Freq OK",
      key: "channel_freq_ok",
    },
  ],
};
