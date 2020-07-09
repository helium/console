import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteOrganization } from '../../actions/organization'
import sort from 'lodash/sortBy'
import find from 'lodash/find'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo'
import { ALL_ORGANIZATIONS } from '../../graphql/organizations'
import numeral from 'numeral'
import { Modal, Button, Typography, Select, Row, Col } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  }
}

@connect(null, mapDispatchToProps)
@graphql(ALL_ORGANIZATIONS, queryOptions)
class DeleteOrganizationModal extends Component {
  state = {
    destinationOrgId: null
  }

  handleSetOrg = destinationOrgId => {
    this.setState({ destinationOrgId })
  }

  handleSubmit = () => {
    const { selectedOrgId } = this.props

    analyticsLogger.logEvent("ACTION_DELETE_ORG", {"id": selectedOrgId })
    this.props.deleteOrganization(selectedOrgId, this.state.destinationOrgId)
    this.props.onClose()
  }

  render() {
    const { open, onClose, selectedOrgId } = this.props
    const { allOrganizations } = this.props.data

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
              disabled={!this.state.destinationOrgId}
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
          allOrganizations && selectedOrgId && (
            <div style={{ ...styles.center, marginTop: 20 }}>
              <Text style={{ fontWeight: 500, color: 'black' }}>
                {`This organization has a DC Balance of ${numeral(find(allOrganizations, { id: selectedOrgId }).dc_balance).format('0,0')} DC.`}
              </Text>
            </div>
          )
        }

        <div style={{ ...styles.center, marginTop: 15 }}>
          <Text style={{ color: '#595959' }}>Please select an organization to receive this balance upon deletion.</Text>
        </div>

        <div style={{ ...styles.center, marginTop: 40 }}>
          <Select
            value={this.state.destinationOrgId}
            onChange={this.handleSetOrg}
            style={{ width: '50%', color: this.state.destinationOrgId == 'no-transfer' && '#F5222D' }}
          >
            {
              allOrganizations && sort(allOrganizations, ['name']).map(o => (
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
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteOrganization }, dispatch)
}

export default DeleteOrganizationModal
