import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import find from 'lodash/find'
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
  render() {
    const { open, onClose } = this.props

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
              onClick={() => {}}
              type="danger"
              ghost
            >
              Delete Organization
            </Button>,
          ]
        }
      >
        <div style={styles.center}>
          <Text style={{ fontSize: 30, fontWeight: 500, color: 'black' }}>Delete Organization?</Text>
        </div>

        <div style={{ ...styles.center, marginTop: 20 }}>
          <Text style={{ fontWeight: 500, color: 'black' }}>This organization has a DC Balance of 0 DC.</Text>
        </div>

        <div style={{ ...styles.center, marginTop: 15 }}>
          <Text style={{ color: '#595959' }}>Please select an organization to receive this balance upon deletion.</Text>
        </div>

      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ }, dispatch)
}

export default DeleteOrganizationModal
