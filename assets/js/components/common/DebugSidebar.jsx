import React from 'react'
import { debugSidebarBackgroundColor, debugTextColor } from '../../util/colors'
import { Typography } from 'antd';
const { Text } = Typography

const DebugSidebar = ({ show, toggle, data }) => (
  <div
    style={{
      backgroundColor: debugSidebarBackgroundColor,
      position: 'absolute',
      top: 64,
      width: 500,
      height: 'calc(100vh - 64px)',
      right: show ? 0 : -500,
      zIndex: 10,
      padding: 20,
      transition: 'all 0.5s ease'
    }}
  >
    <div
      style={{
        transform: 'rotate(-90deg)',
        position: 'absolute',
        left: -52,
        top: 80,
        backgroundColor: debugSidebarBackgroundColor,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        paddingBottom: 10,
        borderRadius: '10px 10px 0px 0px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onClick={toggle}
    >
      <Text style={{ color: 'white' }}>Debug</Text>
    </div>
    {
      data.map(d => (
        <Text code style={{ color: debugTextColor }}>{JSON.stringify(d)}</Text>
      ))
    }
  </div>
)

export default DebugSidebar
