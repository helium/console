import React, { Component } from 'react'
import { Typography, Input, Divider, Icon, Row, Col } from 'antd';
const { Text } = Typography

class ExistingCardsAddCard extends Component {
  state = {
    cardNumber: "",
    monthYear: "",
    cardPin: "",
  }

  handleInputUpdate = (e) => {
    if (e.target.name == 'cardNumber' && e.target.value.length > 16) return
    if (e.target.name == 'monthYear' && e.target.value.length > 4) return
    if (e.target.name == 'cardPin' && e.target.value.length > 3) return
    this.setState({ [e.target.name]: e.target.value}, () => {
      this.props.handleNewCardUpdate(this.state)
    })
  }

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

        <div>
          <Text strong>
            ...or Add New Card
          </Text>
          <Row style={{ marginTop: 12 }}>
            <Input
              placeholder="Card Number"
              name="cardNumber"
              value={this.state.cardNumber}
              onChange={this.handleInputUpdate}
              suffix={
                <Icon type="credit-card" theme="filled" style={{ color: '#BFBFBF'}}/>
              }
            />
          </Row>
          <Row gutter={12} style={{ marginTop: 12 }}>
            <Col span={12}>
              <Input
                placeholder="MM/YY"
                name="monthYear"
                value={this.state.monthYear}
                onChange={this.handleInputUpdate}
                suffix={
                  <Icon type="calendar" theme="filled" style={{ color: '#BFBFBF'}}/>
                }
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="CVV"
                name="cardPin"
                value={this.state.cardPin}
                onChange={this.handleInputUpdate}
                suffix={
                  <Icon type="lock" theme="filled" style={{ color: '#BFBFBF'}}/>
                }
              />
            </Col>
          </Row>
        </div>
      </React.Fragment>
    )
  }
}

export default ExistingCardsAddCard
