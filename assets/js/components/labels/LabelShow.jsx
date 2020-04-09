import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import UpdateLabelModal from './UpdateLabelModal'
import LabelAddDeviceModal from './LabelAddDeviceModal'
import RemoveDevicesFromLabelModal from './RemoveDevicesFromLabelModal'
import LabelShowTable from './LabelShowTable'
import DashboardLayout from '../common/DashboardLayout'
import DebugSidebar from '../common/DebugSidebar'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { updateLabel, addDevicesToLabels } from '../../actions/label'
import { LABEL_SHOW, LABEL_UPDATE_SUBSCRIPTION } from '../../graphql/labels'
import { LABEL_DEBUG_EVENTS_SUBSCRIPTION } from '../../graphql/events'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Button, Typography } from 'antd';
const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(LABEL_SHOW, queryOptions)
class LabelShow extends Component {
  state = {
    showUpdateLabelModal: false,
    showLabelAddDeviceModal: false,
    showRemoveDevicesFromLabelModal: false,
    devicesToRemove: [],
    showDebugSidebar: false,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_LABEL_SHOW")
    const { subscribeToMore, fetchMore } = this.props.data

    subscribeToMore({
      document: LABEL_UPDATE_SUBSCRIPTION,
      variables: { id: this.props.match.params.id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          variables: { id: this.props.match.params.id },
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  openUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: true })
  }

  closeUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: false })
  }

  openLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: true })
  }

  closeLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: false })
  }

  openRemoveDevicesFromLabelModal = (devicesToRemove) => {
    this.setState({ showRemoveDevicesFromLabelModal: true, devicesToRemove })
  }

  closeRemoveDevicesFromLabelModal = () => {
    this.setState({ showRemoveDevicesFromLabelModal: false })
  }

  handleUpdateLabel = (name, color) => {
    const labelId = this.props.match.params.id
    const attrs = name ? { name, color } : { color }
    this.props.updateLabel(labelId, attrs)
  }

  handleToggleDebug = () => {
    const { showDebugSidebar } = this.state

    this.setState({ showDebugSidebar: !showDebugSidebar })
  }

  render() {
    const { loading, error, label } = this.props.data
    if (loading) return <DashboardLayout />
    if (error) return <Text>Data failed to load, please reload the page and try again</Text>

    const normalizedDevices = label.devices.reduce((map, device) => {
      map[device.id] = device
      return map
    }, {})

    return (
      <div>
        <DashboardLayout
          breadCrumbs={
            <div style={{ marginLeft: 4, paddingBottom: 20 }}>
              <Link to="/labels"><Text style={{ color: "#8C8C8C" }}>Labels&nbsp;&nbsp;/</Text></Link>
              <Text>&nbsp;&nbsp;{label.name}</Text>
            </div>
          }
          title={`${label.name}`}
          extra={
            <UserCan>
              <Button
                size="large"
                icon="setting"
                onClick={this.openUpdateLabelModal}
              >
                Label Settings
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={this.openLabelAddDeviceModal}
                icon="tag"
                style={{ marginLeft: 20 }}
              >
                Add this Label to a Device
              </Button>
            </UserCan>
          }
        >
          <LabelTag text={label.name} color={label.color} hasIntegrations={label.channels.length > 0} style={{ position: 'relative', top: -30 }}/>

          <LabelShowTable labelId={this.props.match.params.id} openRemoveDevicesFromLabelModal={this.openRemoveDevicesFromLabelModal} history={this.props.history}/>

          <UpdateLabelModal
            handleUpdateLabel={this.handleUpdateLabel}
            open={this.state.showUpdateLabelModal}
            onClose={this.closeUpdateLabelModal}
            label={label}
          />

          <LabelAddDeviceModal
            label={label}
            labelNormalizedDevices={normalizedDevices}
            addDevicesToLabels={this.props.addDevicesToLabels}
            open={this.state.showLabelAddDeviceModal}
            onClose={this.closeLabelAddDeviceModal}
          />

          <RemoveDevicesFromLabelModal
            label={label}
            open={this.state.showRemoveDevicesFromLabelModal}
            onClose={this.closeRemoveDevicesFromLabelModal}
            devicesToRemove={this.state.devicesToRemove}
          />

          <DebugSidebar
            show={this.state.showDebugSidebar}
            toggle={this.handleToggleDebug}
            subscription={LABEL_DEBUG_EVENTS_SUBSCRIPTION}
            variables={{ label_id: this.props.match.params.id }}
            subscriptionKey="labelDebugEventAdded"
          />
        </DashboardLayout>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateLabel, addDevicesToLabels }, dispatch)
}

export default LabelShow
