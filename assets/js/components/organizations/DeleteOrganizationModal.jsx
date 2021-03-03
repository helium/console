import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteOrganization } from '../../actions/organization'
import sort from 'lodash/sortBy'
import find from 'lodash/find'
import analyticsLogger from '../../util/analyticsLogger'
import withGql from '../../graphql/withGql'
import { ALL_ORGANIZATIONS } from '../../graphql/organizations'
import numeral from 'numeral'
import { Modal, Button, Typography, Select, Row, Col, Input } from 'antd';
const { Text } = Typography
const { Option } = Select

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  }
}

class DeleteOrganizationModal extends Component {
  state = {
    destinationOrgId: null,
    confirmText: ""
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.setState({
        destinationOrgId: null,
        confirmText: ""
      })
    }
  }

  handleSetOrg = destinationOrgId => {
    this.setState({ destinationOrgId })
  }

  handleInputUpdate = (e) => {
    this.setState({ confirmText: e.target.value })
  }

  handleSubmit = () => {
    const { selectedOrgId } = this.props

    const currentOrg = find(this.props.allOrganizationsQuery.allOrganizations, { id: selectedOrgId })

    analyticsLogger.logEvent("ACTION_DELETE_ORG", {"id": selectedOrgId, "name": currentOrg.name })
    if (!currentOrg.dc_balance || currentOrg.dc_balance < 1) {
      this.props.deleteOrganization(selectedOrgId)
    } else {
      this.props.deleteOrganization(selectedOrgId, this.state.destinationOrgId)
    }

    this.props.onClose()
  }

  render() {
    const { open, onClose, selectedOrgId } = this.props
    const { allOrganizations } = this.props.allOrganizationsQuery

    const currentOrg = allOrganizations ? find(allOrganizations, { id: selectedOrgId }) : null
    const DELETE_ORG_TEXT = currentOrg ? currentOrg.name + " DELETE" : ""

    return(
      <Modal
        visible={open}
        onCancel={onClose}
        centered
        footer={
          [
            <Button
              key="back"
              onClick={this.props.onClose}
              type="primary"
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              onClick={this.handleSubmit}
              type="danger"
              ghost
              disabled={(currentOrg && currentOrg.dc_balance && !this.state.destinationOrgId) || (currentOrg && this.state.confirmText !== DELETE_ORG_TEXT)}
            >
              Delete Organization
            </Button>,
          ]
        }
      >
        <div style={styles.center}>
          <Text style={{ fontSize: 30, fontWeight: 500, color: 'black' }}>Delete Organization?</Text>
        </div>

        {
          currentOrg && currentOrg.dc_balance && (
            <div>
              <div style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: 500, color: 'black' }}>
                  {`This organization has a DC balance of ${numeral(currentOrg.dc_balance).format('0,0')} DC.`}
                </Text>
              </div>
              {
                currentOrg.received_free_dc && (
                  <div style={{ marginTop: 5 }}>
                    <Text style={{ fontWeight: 500, color: 'black' }}>
                      {`The transferable DC balance is ${numeral(Math.max(currentOrg.dc_balance - 10000, 0)).format('0,0')} DC since you received 10,000 DC to start, which cannot be transferred.`}
                    </Text>
                  </div>
                )
              }
              {
                currentOrg.received_free_dc && currentOrg.dc_balance < 10001 ? (
                  <div style={{ marginTop: 15 }}>
                    <Text style={{ color: '#595959' }}>Please select Destroy DC to verify that you would like to proceed.</Text>
                  </div>
                ) : (
                  <div style={{ marginTop: 15 }}>
                    <Text style={{ color: '#595959' }}>Please select an organization to receive this balance upon deletion.</Text>
                  </div>
                )
              }

              <div style={{ ...styles.center, marginTop: 40 }}>
                <Select
                  value={this.state.destinationOrgId}
                  onChange={this.handleSetOrg}
                  style={{ width: '50%', color: this.state.destinationOrgId == 'no-transfer' && '#F5222D' }}
                >
                  {
                    allOrganizations && !(currentOrg.received_free_dc && currentOrg.dc_balance < 10001) && sort(allOrganizations, ['name']).map(o => (
                      <Option value={o.id} key={o.id} disabled={o.id == selectedOrgId}>
                        {o.name}
                      </Option>
                    ))
                  }
                  <Option value="no-transfer" style={{ color: '#F5222D'}}>
                    Destroy DC
                  </Option>
                </Select>
              </div>
            </div>
          )
        }

        {
          currentOrg && (
            <div style={{ marginTop: 30 }}>
              <Text style={{ fontWeight: 500, color: 'black' }}>
                {`This organization has ${currentOrg.active_count + currentOrg.inactive_count} device(s). Are you sure you want to delete the organization?`}
              </Text>

              <div style={{ marginTop: 15 }}>
                <Text style={{ display: 'block' }}>{`To continue, please enter "${DELETE_ORG_TEXT}"`}</Text>
                <Input
                  name="confirmText"
                  value={this.state.confirmText}
                  onChange={this.handleInputUpdate}
                />
              </div>
            </div>
          )
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteOrganization }, dispatch)
}

export default connect(null, mapDispatchToProps)(
  withGql(DeleteOrganizationModal, ALL_ORGANIZATIONS, props => ({ fetchPolicy: 'cache-and-network', name: 'allOrganizationsQuery' }))
)
