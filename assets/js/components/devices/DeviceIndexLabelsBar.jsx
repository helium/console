import React, { Component } from 'react'
import NavPointTriangle from './NavPointTriangle'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { ALL_LABELS } from '../../graphql/labels'
import { Typography } from 'antd';
const { Text } = Typography
import GroupsIcon from '../../../img/label-node-icon.svg'

const Node = ({ name, device_count, selectLabel, id, currentPage }) => (
  <div style={{
    background: '#2C79EE',
    padding: "4px 24px 4px 8px",
    borderRadius: 5,
    height: 50,
    marginRight: 12,
    cursor: "pointer",
    position: 'relative'
  }} onClick={() => selectLabel("Label+" + id)}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <img src={GroupsIcon} style={{ height: 11, marginRight: 4 }} />
      <Text style={{ display: 'block', fontSize: 14, color: '#ffffff', fontWeight: 500, whiteSpace: 'nowrap' }}>{name}</Text>
    </div>
    <Text style={{ display: 'block', fontSize: 12, color: '#ffffff', whiteSpace: 'nowrap' }}>{device_count || 0} Devices</Text>
    {
      currentPage === "Label+" + id && <NavPointTriangle />
    }
  </div>
)

class DeviceIndexLabelsBar extends Component {
  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:device_index_labels_bar", {})
    this.channel.join()
    this.channel.on(`graphql:device_index_labels_bar:${currentOrganizationId}:label_list_update`, (message) => {
      this.props.allLabelsQuery.refetch()
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  render() {
    const { loading, error, allLabels } = this.props.allLabelsQuery

    if (loading) return <div />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {allLabels.map(l => (
          <Node key={l.id} name={l.name} device_count={l.device_count} id={l.id} selectLabel={this.props.selectLabel} currentPage={this.props.currentPage}/>
        ))}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(DeviceIndexLabelsBar, ALL_LABELS, props => ({ fetchPolicy: 'cache-first', variables: {}, name: 'allLabelsQuery' }))
)
