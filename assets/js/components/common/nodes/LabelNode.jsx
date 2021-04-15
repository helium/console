import React, { Component, Fragment } from 'react'
import withGql from '../../../graphql/withGql'
import { connect } from 'react-redux'
import { GET_LABEL_NAME } from '../../../graphql/labels'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import GroupsIcon from '../../../../img/label-node-icon.svg';

class LabelNode extends Component {
  render() {
    const { loading, error } = this.props.labelNameQuery;

    if (loading || error) return null;

    const { label } = this.props.labelNameQuery.data;

    return (
      <Fragment>
        <div style={{ background: '#2C79EE' }} className="simple-node">
          <Handle type="target" position="left" className="node-handle" style={{ border: '3.5px solid #2C79EE' }} />
          <div className="node-content">
            <img src={GroupsIcon} style={{ height: 14, marginRight: 8 }} />
            <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{label.name}</Text>
          </div>
          <Handle type="source" position="right" className="node-handle" style={{ border: '3.5px solid #2C79EE' }} />
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