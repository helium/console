import React, { Component, Fragment } from 'react';
import withGql from '../../graphql/withGql'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { logOut, getMfaStatus, enrollInMfa } from '../../actions/auth';
import { generateKey, deleteKey } from '../../actions/apiKeys';
import DashboardLayout from '../common/DashboardLayout';
import UserCan from '../common/UserCan';
import ProfileNewKeyModal from './ProfileNewKeyModal';
import RoleName from '../common/RoleName';
import analyticsLogger from '../../util/analyticsLogger';
import { displayInfo } from '../../util/messages';
import { ALL_API_KEYS } from '../../graphql/apiKeys';
import { Typography, Button, Card, Descriptions, Input, Select, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import * as rest from '../../util/rest';
const { Text } = Typography
const { Option } = Select

class Profile extends Component {
  state = {
    name: "",
    role: null,
    newKey: null,
    showEnrollButton: null,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:api_keys", {})
    this.channel.join()
    this.channel.on(`graphql:api_keys:${currentOrganizationId}:api_key_list_update`, (message) => {
      this.props.apiKeysQuery.refetch()
    })

    this.props.getMfaStatus()
    .then(({ data }) => {
      this.setState({ showEnrollButton: !data.enrollment_status })
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleInputUpdate = (e) => {
    this.setState({ name: e.target.value })
  }

  handleSelectOption = (role) => {
    this.setState({ role })
  }

  handleSubmit = () => {
    const { name, role } = this.state
    this.props.generateKey(name, role)
      .then(newKey => {
        analyticsLogger.logEvent("ACTION_GENERATE_API_KEY", { name, role, userId: this.props.user.id })
        this.setState({ newKey })
      })
  }

  handleCloseModal = () => {
    this.setState({ newKey: null })
  }

  handleEnrollInMfa = () => {
    this.props.enrollInMfa()
    .then(response => {
      if (response.status === 200) displayInfo("Please check your email for a Two-Factor sign up link")
    })
  }

  render() {
    const { email } = this.props.user;
    const { role } = this.props;
    const { logOut } = this.props
    const { apiKeys } = this.props.apiKeysQuery
    const { newKey } = this.state

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Role',
        dataIndex: 'role',
      },
      {
        title: 'Date Added',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: 'Activated',
        dataIndex: 'active',
        render: r => (
          <Text>{r.toString()}</Text>
        )
      },
      {
        title: 'Added By',
        dataIndex: 'user',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <div style={{ display: 'flex', justifyContent: 'center'}}>
            <UserCan noManager>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                onClick={() => this.props.deleteKey(record.id)}
              />
            </UserCan>
          </div>
        )
      },
    ]

    return(
      <DashboardLayout title="Profile" user={this.props.user}>
        <div style={{ padding: "30px 30px 10px 30px", height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: 6, overflow: 'hidden', boxShadow: '0px 20px 20px -7px rgba(17, 24, 31, 0.19)' }}>
          <Card title="Profile Details">
            <Descriptions bordered column={4}>
              <Descriptions.Item span={4} label="Your Email is">{email}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              {
                this.state.showEnrollButton && (
                  <UserCan noManager>
                    <Button
                      type="primary"
                      onClick={this.handleEnrollInMfa}
                      style={{ marginRight: 10 }}
                    >
                      Enroll In 2FA
                    </Button>
                  </UserCan>
                )
              }
              {
                this.state.showEnrollButton === false && (
                  <Button
                    type="primary"
                    style={{ marginRight: 10 }}
                    disabled
                  >
                    Enrolled In 2FA
                  </Button>
                )
              }
              <Button
                type="danger"
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_LOGOUT", { "email": email})
                  logOut()
                }}
                style={{ marginRight: 0 }}
              >
                Log Out
              </Button>
            </div>
          </Card>

          <UserCan noManager>
            <Card title="Your API Keys">
              <Input
                placeholder="Enter key name"
                onChange={this.handleInputUpdate}
                style={{ width: 180 }}
              />
              <Select
                placeholder="Select key role"
                style={{ width: 180, marginLeft: 10 }}
                onChange={this.handleSelectOption}
              >
                <Option value={role}><RoleName role={role} /></Option>
              </Select>
              <Button
                type="primary"
                onClick={this.handleSubmit}
                style={{ marginLeft: 10 }}
              >
                Generate Key
              </Button>

              {
                apiKeys && (
                  <div style={{ marginTop: 20, overflowX: 'scroll' }}>
                    <Table
                      columns={columns}
                      dataSource={apiKeys}
                      rowKey={record => record.id}
                      pagination={false}
                      bordered
                      style={{ minWidth: 800 }}
                    />
                  </div>
                )
              }
            </Card>
          </UserCan>
        </div>

        <ProfileNewKeyModal
          newKey={newKey}
          onClose={this.handleCloseModal}
        />
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    role: state.organization.currentRole,
    socket: state.apollo.socket,
    currentOrganizationId: state.organization.currentOrganizationId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, generateKey, deleteKey, getMfaStatus, enrollInMfa }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(Profile, ALL_API_KEYS, props => ({ fetchPolicy: 'cache-first', variables: {}, name: 'apiKeysQuery' }))
)
