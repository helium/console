import React, { Component } from 'react';
import { Typography, Input, Tooltip, Icon, Radio, Card } from 'antd';
const { Text } = Typography
import { Row, Col } from 'antd';
import { SEARCH_FUNCTIONS } from '../../graphql/search';
import { createFunction } from '../../actions/function';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { bindActionCreators } from 'redux';
import FunctionValidator from '../functions/FunctionValidator';

const queryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

@connect(null, mapDispatchToProps)
@graphql(SEARCH_FUNCTIONS, queryOptions)
class DecoderForm extends Component {
  state = {
    format: 'cayenne',
    body: '',
    searchFunctions: []
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data
    if (!loading) {
      fetchMore({
        variables: { query: value },
        updateQuery: (prev, { fetchMoreResult }) => {
          const { searchFunctions } = fetchMoreResult

          this.setState({ searchFunctions })
        }
      })
    }
  }

  handleDecoderChange =(e) => {
    this.setState({ format: e.target.value }, () => {
      this.setState({ body: e.target.value === 'custom' ? "function Decoder(bytes, port) { \n\n  return decoded; \n}" : '' });
    });
  }

  render() {
    const { format } = this.state;
    const { searchFunctions } = this.state
    console.log(searchFunctions)

    return (
      <div>
        <Card title="Step 3 - Choose your decoder (Required)">
          <Row gutter={16} style={{marginBottom: 16 }}>
            <Text>Decoder Format</Text>
            <br />
            <Radio.Group onChange={this.handleDecoderChange} value={format}>
              <Radio value="cayenne" style={{ fontSize: '16px' }}>Cayenne LPP (Default)</Radio>
              <Radio value="custom" style={{ fontSize: '16px' }}>Custom</Radio>
            </Radio.Group>
          </Row>
        </Card>
        { format === 'custom' && (
          <FunctionValidator body={this.state.body} />
        )}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createFunction }, dispatch);
}

export default DecoderForm;