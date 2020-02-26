import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import UpdateLabelModal from './UpdateLabelModal'
import LabelAddDeviceModal from './LabelAddDeviceModal'
import RemoveDevicesFromLabelModal from './RemoveDevicesFromLabelModal'
import LabelShowTable from './LabelShowTable'
import DashboardLayout from '../common/DashboardLayout'
import LabelTag from '../common/LabelTag'
import { updateLabel, addDevicesToLabels } from '../../actions/label'
import { LABEL_SHOW, LABEL_UPDATE_SUBSCRIPTION } from '../../graphql/labels'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Typography } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class LabelShow extends Component {
  state = {
    showUpdateLabelModal: false,
    showLabelAddDeviceModal: false,
    showRemoveDevicesFromLabelModal: false,
    devicesToRemove: [],
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_LABEL_SHOW")

    const { subscribeToMore, fetchMore } = this.props.data
    const variables = { id: this.props.match.params.id }

    subscribeToMore({
      document: LABEL_UPDATE_SUBSCRIPTION,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          variables,
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
    // analyticsLogger.logEvent("ACTION_UPDATE_LABEL", {"name": name, "id": labelId})
  }

  render() {
    const { loading, label } = this.props.data
    if (loading) return <DashboardLayout />

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
            <span>
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
            </span>
          }
        >
          <LabelTag text={label.name} color={label.color} style={{ position: 'relative', top: -30 }}/>

          <LabelShowTable labelId={this.props.match.params.id} openRemoveDevicesFromLabelModal={this.openRemoveDevicesFromLabelModal} />

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
        </DashboardLayout>
      </div>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateLabel, addDevicesToLabels }, dispatch)
}

const LabelShowWithData = graphql(LABEL_SHOW, queryOptions)(LabelShow)

export default LabelShowWithData
