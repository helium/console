import React, { Component, Fragment } from 'react';
import withGql from '../../../graphql/withGql'
import { connect } from 'react-redux'
import { GET_FUNCTION_NAME } from '../../../graphql/functions'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import FunctionIcon from '../../../../img/function-node-icon.svg';

class FunctionNode extends Component {
  render() {
    const { loading, error } = this.props.functionNameQuery;

    if (loading || error) return null;

    const { function: thisFunction } = this.props.functionNameQuery.data;

    return (
      <Fragment>
        <div style={{ background: '#9E59F6' }} className="simple-node">
          <div className="node-content">
            <img src={FunctionIcon} style={{ height: 16, marginRight: 8 }} />
            <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{thisFunction.name}</Text>
          </div>
          <Handle
            type="target"
            position="left"
            className="node-handle"
            style={{ border: '3.5px solid #9E59F6' }}
          />
          <Handle
            type="source"
            position="right"
            className="node-handle"
            style={{ border: '3.5px solid #9E59F6' }}
          />
        </div>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket
  };
}

export default connect(mapStateToProps, null)(
  withGql(FunctionNode, GET_FUNCTION_NAME, props => ({ fetchPolicy: 'cache-first', variables: { id: props.data.label }, name: 'functionNameQuery' }))
)
