import React from 'react';
import { Switch, Typography } from 'antd';
const { Text } = Typography
import { adrText } from '../../adr/AdrIndex'

export default ({ checked, from, updateAdr }) => (
  <div>
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Switch
        onChange={adrValue => updateAdr(adrValue)}
        checked={checked}
        style={{ marginRight: 8 }}
      />
      <Text strong style={{ fontSize: 16 }}>Allow ADR (recommended for stationary devices)</Text>
    </div>

    <div style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14 }}>{
        adrText
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
