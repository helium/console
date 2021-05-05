import React, { Component } from 'react';
import { connect } from 'react-redux'
import DeviceIndexLabelsBar from './DeviceIndexLabelsBar';
import DashboardLayout from '../common/DashboardLayout';
import NavPointTriangle from '../common/NavPointTriangle';
import TableHeader from '../common/TableHeader';
import { DEVICE_COUNT } from '../../graphql/devices';
import withGql from '../../graphql/withGql'
import HomeIcon from '../../../img/devices/device-index-home-icon.svg'
import AllIcon from '../../../img/devices/device-index-all-icon.svg'
import PlusIcon from '../../../img/devices/device-index-plus-icon.svg'
import PlusDeviceIcon from '../../../img/devices/device-index-plus-device-icon.svg'

class DeviceDashboardLayout extends Component {
  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:devices_header_count", {})
    this.channel.join()
    this.channel.on(`graphql:devices_header_count:${currentOrganizationId}:device_list_update`, (message) => {
      this.props.deviceCountQuery.refetch()
    })

    if (!this.props.deviceCountQuery.loading) {
      this.props.deviceCountQuery.refetch()
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  render() {
    const { device_count } = this.props.deviceCountQuery

    return(
      <DashboardLayout
        title="My Devices"
        user={this.props.user}
      >
        <TableHeader
          backgroundColor='#D3E0EE'
          goHome={() => this.props.history.push('/devices/home')}
          otherColor='#ACC6DD'
          homeIcon={HomeIcon}
          goToAll={() => this.props.history.push('/devices')}
          allIcon={AllIcon}
          textColor='#3C6B95'
          allText='All Devices'
          allSubtext={device_count && device_count.count + ' Devices'}
          onHomePage={this.props.history.location.pathname === '/devices/home'}
          onAllPage={this.props.history.location.pathname === '/devices'}
          onNewPage={this.props.history.location.pathname === '/devices/new'}
          addIcon={PlusDeviceIcon}
          goToNew={() => this.props.history.push('/devices/new')}
          extraContent={
            <React.Fragment>
              <div style={{
                backgroundColor: '#ACC6DD',
                borderRadius: 6,
                padding: 10,
                cursor: 'pointer',
                height: 50,
                width: 50,
                minWidth: 50,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                whiteSpace: 'nowrap',
                position: 'relative'
              }} onClick={() => this.props.history.push('/devices/new_label')}>
                <img src={PlusIcon} style={{ height: 20 }} />
                {
                  this.props.history.location.pathname === '/devices/new_label' && <NavPointTriangle />
                }
              </div>
              <DeviceIndexLabelsBar push={this.props.history.push} pathname={this.props.history.location.pathname} />
            </React.Fragment>
          }
        >
          {this.props.children}
        </TableHeader>
      </DashboardLayout>
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
  withGql(DeviceDashboardLayout, DEVICE_COUNT, props => ({ fetchPolicy: 'cache-first', name: 'deviceCountQuery' }))
)
