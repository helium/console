import React, { Component } from 'react';
import { ALL_FUNCTIONS } from '../../graphql/functions';
import withGql from '../../graphql/withGql'
import { Typography, Radio, Card, Row, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

class AdafruitFunctionForm extends Component {
  state = {
    format: 'cayenne',
    functionSelected: null
  }

  handleFormatChange =(e) => {
    this.setState({ format: e.target.value })

    if (e.target.value === 'cayenne') {
      this.props.handleFunctionUpdate({
        format: 'cayenne'
      })
    }
  }

  handleCustomFunctionSelection = value => {
    this.setState({ functionSelected: value })

    this.props.handleFunctionUpdate({
      format: 'custom',
      id: value
    })
  }

  render() {
    const { format, functionSelected } = this.state;
    const { allFunctions } = this.props.allFunctionsQuery;

    return (
      <div>
        <Card title="Step 4 - Choose your function (Required)">
          <Text style={{ display: 'block'}} strong>Function Format</Text>
          <Row style={{marginBottom: 16 }}>
            <Radio.Group onChange={this.handleFormatChange} value={format}>
              <Radio value="cayenne" style={{ fontSize: '16px' }}>Cayenne LPP (Default)</Radio>
              <Radio value="custom" style={{ fontSize: '16px' }}>Custom</Radio>
            </Radio.Group>
          </Row>
          { format === 'custom' && (
            <Select
              value={this.state.functionSelected}
              onChange={this.handleCustomFunctionSelection}
              style={{ minWidth: 280 }}
              placeholder="Select an existing function..."
            >
              {
                allFunctions.map(f => (
                  <Option value={f.id} key={f.id}>
                    {f.name}
                  </Option>
                ))
              }
            </Select>
          )}
          { (format !== "custom" || functionSelected) && this.props.children }
        </Card>
      </div>
    );
  }
}

export default withGql(AdafruitFunctionForm, ALL_FUNCTIONS, props => ({ fetchPolicy: 'cache-first', variables: {}, name: 'allFunctionsQuery' }))
