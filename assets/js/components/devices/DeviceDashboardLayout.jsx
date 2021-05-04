import React, { Component } from 'react';
import DeviceIndexLabelsBar from './DeviceIndexLabelsBar';
import DashboardLayout from '../common/DashboardLayout';
import NavPointTriangle from '../common/NavPointTriangle';
import TableHeader from '../common/TableHeader';
import HomeIcon from '../../../img/devices/device-index-home-icon.svg'
import AllIcon from '../../../img/devices/device-index-all-icon.svg'
import PlusIcon from '../../../img/devices/device-index-plus-icon.svg'
import PlusDeviceIcon from '../../../img/devices/device-index-plus-device-icon.svg'

class DeviceDashboardLayout extends Component {
  render() {
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
          allSubtext='Devices'
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
              <DeviceIndexLabelsBar selectLabel={() => {}} />
            </React.Fragment>
          }
        >
          {this.props.children}
        </TableHeader>
      </DashboardLayout>
    )
  }
}

export default DeviceDashboardLayout
