import React, { Component } from 'react';
import { Typography, Radio, Card } from 'antd';
const { Text } = Typography
import { Row, } from 'antd';
import { ALL_FUNCTIONS } from '../../graphql/functions';
import { graphql } from 'react-apollo';
import FunctionsSearch from '../common/FunctionsSearch';

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(ALL_FUNCTIONS, queryOptions)
class DecoderForm extends Component {
  state = {
    format: 'cayenne',
    functionSelected: null
  }

  handleDecoderChange =(e) => {
    this.setState({ format: e.target.value }, () => {
      if (e.target.value === 'cayenne') {
        this.setState({ functionSelected: null })
      }
      this.props.onChange({ format: e.target.value });
    });
  }

  handleFunctionSelection = value => {
    this.setState({ functionSelected: value },
      this.props.onChange({ format: this.state.format, func: { id: value }}));
  }

  render() {
    const { format } = this.state;
    const { allFunctions } = this.props.data;

    return (
      <div>
        <Card title="Step 4 - Choose your decoder (Required)">
          <Text style={{ display: 'block'}} strong>Decoder Format</Text>
          <Row style={{marginBottom: 16 }}>  
            <Radio.Group onChange={this.handleDecoderChange} value={format}>
              <Radio value="cayenne" style={{ fontSize: '16px' }}>Cayenne LPP (Default)</Radio>
              <Radio value="custom" style={{ fontSize: '16px' }}>Custom</Radio>
            </Radio.Group>
          </Row>
          { format === 'custom' && (
            <Row style={{marginBottom: 16 }}>
              <FunctionsSearch allFunctions={allFunctions} handleFunctionSelection={this.handleFunctionSelection} />
            </Row>
          )}
          {this.props.children}
        </Card>
      </div>
    );
  }
}

export default DecoderForm;
