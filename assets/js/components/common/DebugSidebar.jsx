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
      width: show ? 500 : 0,
      height: 'calc(100vh - 64px)',
      right: 0,
      zIndex: 10,
      padding: 0,
      transition: 'all 0.5s ease',
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
    <div style={{ height: '100%', width: '100%', overflow: 'scroll'}}>
      {
        data.map(d => (
          <div key={d.id} style={{ paddingLeft: 20, paddingRight: 20, width: '100%' }}>
            <Text code style={{ color: debugTextColor, marginBottom: 10 }}>
              <pre>
                {JSON.stringify(d, null, 2)}
              </pre>
            </Text>
          </div>
        ))
      }
    </div>
  </div>
)

export default DebugSidebar
