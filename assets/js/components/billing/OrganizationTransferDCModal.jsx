import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import find from 'lodash/find'
import { transferDC } from '../../actions/dataCredits'
import { graphql } from 'react-apollo'
import { ALL_ORGANIZATIONS } from '../../graphql/organizations'
import numeral from 'numeral'
import { Modal, Button, Typography, Input, Select, Row, Col } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

const styles = {
  container: {
    marginBottom: 30,
  },
  checkboxContainer: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row'
  },
  amountContainer: {
    backgroundColor: '#E6F7FF',
    padding: 24,
    borderRadius: 8,
  },
  inputHeader: {
    color: '#096DD9',
  },
  input: {
    marginTop: 8
  },
  orgName: {
    fontSize: 18,
    color: '#38A2FF'
  }
}

@connect(null, mapDispatchToProps)
@graphql(ALL_ORGANIZATIONS, queryOptions)
class OrganizationTransferDCModal extends Component {
  state = {
    showConfirm: false,
    selectedOrgId: undefined,
    countDC: undefined
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.open && !this.props.open) {
      this.setState({
        showConfirm: false,
        selectedOrgId: undefined,
        countDC: undefined
      })
    }
  }

  handleCountInputUpdate = (e) => {
    this.setState({
      countDC: e.target.value
    })
  }

  handleSelectOrg = selectedOrgId => {
    this.setState({
      selectedOrgId
    })
  }

  handleNext = () => {
    this.setState({ showConfirm: true })
  }

  handleBack = () => {
    this.setState({ showConfirm: false })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.transferDC(this.state.countDC, this.state.selectedOrgId)

    this.props.onClose()
  }

  renderOrgEntry = () => {
    const { organization, data: { allOrganizations } } = this.props
    return (
      <div>
        {
          organization && (
            <React.Fragment>
              <div style={styles.container}>
                <div style={{ marginBottom: 30 }}>
                  <Text strong>You are logged in to <span style={{ color: '#38A2FF' }}>{organization.name}</span>.</Text>
                </div>

                <Text strong>How many Data Credits do you wish to send?</Text>
                <div style={{ ...styles.amountContainer, marginTop: 12 }}>
                  <Text style={styles.inputHeader}>Amount of Data Credits</Text>
                  <Input
                    placeholder="Enter Quantity"
                    name="countDC"
                    value={this.state.countDC}
                    onChange={this.handleCountInputUpdate}
                    style={styles.input}
                    type="number"
                    onKeyPress={e => {
                      if (e.key == ".") e.preventDefault()
                    }}
                  />
                </div>
              </div>

              <div>
                <Text strong>Which Organization should receive them?</Text>
                <div style={{ marginTop: 4 }}>
                  <Select
                    placeholder="Please choose Organization..."
                    value={this.state.selectedOrgId}
                    onChange={this.handleSelectOrg}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    {
                      allOrganizations && allOrganizations.filter(org => org.id !== organization.id).map(org => (
                        <Option value={org.id} key={org.id}>
                          {org.name}
                        </Option>
                      ))
                    }
                  </Select>
                </div>
              </div>
            </React.Fragment>
          )
        }
      </div>
    )
  }

  renderConfirm = () => {
    const { organization, data: { allOrganizations } } = this.props
    return (
      <div>
        <Text strong>You are sending:</Text>
        <div style={{
          ...styles.amountContainer,
          marginTop: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 40, color: '#38A2FF' }}>{numeral(this.state.countDC).format('0,0')} DC</Text>
        </div>

        <Row style={{ marginTop: 20 }}>
          <Col span={12}>
            <div>
              <Text>From</Text>
            </div>
            <div>
              <Text strong style={styles.orgName}>{organization.name}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text>To</Text>
            </div>
            <div>
              <Text strong style={styles.orgName}>{find(allOrganizations, org => org.id === this.state.selectedOrgId)['name']}</Text>
            </div>
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    const { open, onClose, organization } = this.props

    return(
      <Modal
        title={this.state.showConfirm ? "Confirm Transaction" : "Transfer DC to Organization"}
        visible={open}
        onCancel={onClose}
        centered
        footer={
          [
            <Button key="back" onClick={this.state.showConfirm ? this.handleBack : this.props.onClose}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={this.state.showConfirm ? this.handleSubmit : this.handleNext}
              disabled={!this.state.showConfirm && (!this.state.selectedOrgId || !this.state.countDC || this.state.countDC == 0)}
            >
              Make Transfer
            </Button>,
          ]
        }
      >
        {!this.state.showConfirm && this.renderOrgEntry()}
        {this.state.showConfirm && this.renderConfirm()}
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ transferDC }, dispatch)
}

export default OrganizationTransferDCModal
