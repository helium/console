import React, { Component, Fragment } from 'react'
import withGql from '../../../graphql/withGql'
import { connect } from 'react-redux'
import { GET_LABEL_NAME } from '../../../graphql/labels'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import GroupsIcon from '../../../../img/label-node-icon.svg';

const handleStyle = {
  borderRadius: 10,
  background: '#ffffff',
  border: '3.5px solid #2C79EE',
  height: '12px',
  width: '12px'
};

const nodeStyle = {
  background: '#2C79EE',
  padding: '10px 15px',
  borderRadius: 5,
  minWidth: 200,
  minHeight: 30,
};

class LabelNode extends Component {
  render() {
    const { loading, error } = this.props.labelNameQuery;

    if (loading || error) return null;

    const { label } = this.props.labelNameQuery.data;

    return (
      <Fragment>
        <div style={nodeStyle}>
          <Handle type="target" position="left" style={handleStyle} />
          <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <img src={GroupsIcon} style={{ height: 14, marginRight: 8 }} />
            <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{label.name}</Text>
          </div>
          <Handle type="source" position="right" style={handleStyle} />
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
  withGql(LabelNode, GET_LABEL_NAME, props => ({ fetchPolicy: 'cache-first', variables: { id: props.data.label }, name: 'labelNameQuery' }))
)