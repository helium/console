import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { ALL_LABELS } from '../../graphql/labels'
import { Typography } from 'antd';
const { Text } = Typography
import GroupsIcon from '../../../img/label-node-icon.svg'

const Node = ({ name, device_count }) => (
  <div style={{
    background: '#2C79EE',
    padding: "4px 24px 4px 8px",
    borderRadius: 5,
    height: 50,
    overflow: 'hidden',
    marginRight: 12
  }}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <img src={GroupsIcon} style={{ height: 12, marginRight: 4 }} />
      <Text style={{ display: 'block', fontSize: 14, color: '#ffffff', fontWeight: 500, whiteSpace: 'nowrap' }}>{name}</Text>
    </div>
    <Text style={{ display: 'block', fontSize: 12, color: '#ffffff', whiteSpace: 'nowrap' }}>{device_count || 0} Devices</Text>
  </div>
)

class DeviceIndexLabelsBar extends Component {
  componentDidMount() {
    // const { socket, currentOrganizationId } = this.props
    //
    // this.channel = socket.channel("graphql:labels_index_table", {})
    // this.channel.join()
    // this.channel.on(`graphql:labels_index_table:${currentOrganizationId}:label_list_update`, (message) => {
    //   this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    // })
  }

  componentWillUnmount() {
    // this.channel.leave()
  }

  refetchPaginatedEntries = () => {
    // const { refetch } = this.props.paginatedLabelsQuery
    // refetch({ page, pageSize })
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
          <Node key={l.id} name={l.name} device_count={l.device_count}/>
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
