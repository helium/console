import React from 'react';
import { Switch, Typography } from 'antd';
const { Text } = Typography

export default ({ checked, from }) => (
  <div>
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Switch
        onChange={() => {}}
        checked={checked}
        style={{ marginRight: 8 }}
      />
      <Text strong style={{ fontSize: 16 }}>Allow ADR (recommended for stationary devices)</Text>
    </div>

    <div style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14 }}>{
        "Adaptive Data Rate (ADR) needs to be requested by a device for this setting to have an effect. ADR allows devices to use an optimal data rate which reduces power consumption and airtime on the network based on RF conditions. However, it is recommended to only use this setting for fixed or non-mobile devices to ensure reliable connectivity."
      }</Text>
    </div>

    {
      from === "device" && (
        <Text strong style={{ fontSize: 16 }}>Note: If this device belongs to a label that has ADR enabled, ADR will be activated on this device.</Text>
      )
    }
    {
      from === "label" && (
        <Text strong style={{ fontSize: 16 }}>Note: If this label has ADR enabled, all ADR settings of the devices in this label will be ignored.</Text>
      )
    }
  </div>
)
