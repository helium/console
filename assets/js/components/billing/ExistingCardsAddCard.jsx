import React, { Component } from 'react'
import { Typography, Divider } from 'antd';
const { Text } = Typography

class ExistingCardsAddCard extends Component {
  render() {
    return (
      <React.Fragment>
        <div style={{ marginBottom: 24 }}>
          <Text strong>
            Choose from Stored Cards
          </Text>
          <Divider style={{ margin: '8px 0px' }}/>
          <Text>
            None available, create one below...
          </Text>
        </div>
      </React.Fragment>
    )
  }
}

export default ExistingCardsAddCard
