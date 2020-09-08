import React, { Component } from 'react'
import { debugTextColor } from '../../util/colors'
import { Typography } from 'antd';
const { Text } = Typography

class DebugEntry extends Component {
  render() {
    const { data } = this.props
    return (
      <div key={data.id} style={{ paddingLeft: 20, paddingRight: 20, width: '100%' }}>
        <Text code style={{ marginBottom: 10 }}>
          <pre style={{ color: debugTextColor }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Text>
      </div>
    )
  }
}

export default DebugEntry
