import React, { Component, Fragment } from 'react';
import withGql from '../../graphql/withGql'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { logOut } from '../../actions/auth';
import { generateKey, deleteKey } from '../../actions/apiKeys';
import DashboardLayout from '../common/DashboardLayout';
import UserCan from '../common/UserCan';
import ProfileNewKeyModal from './ProfileNewKeyModal';
import RoleName from '../common/RoleName';
import analyticsLogger from '../../util/analyticsLogger';
import { ALL_API_KEYS, API_KEY_SUBSCRIPTION } from '../../graphql/apiKeys';
import { getMfaStatus } from '../../actions/auth';
import { Typography, Button, Card, Descriptions, Input, Select, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import { loginWithRedirect } from '../auth/Auth0Provider';
import * as rest from '../../util/rest';
const { Text } = Typography
const { Option } = Select

class Profile extends Component {
  state = {
    name: "",
    role: null,
    newKey: null,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:api_keys", {})
    this.channel.join()
    this.channel.on(`graphql:api_keys:${currentOrganizationId}:api_key_list_update`, (message) => {
      this.props.apiKeysQuery.refetch()
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

  handleEnrollInMfa = async () => {
    await loginWithRedirect({
      mode: 'enroll_mfa',
      redirect_uri: window.location.href
    });
  }

  render() {
    const { email } = this.props.user;
    const { role, mfaEnrollmentStatus } = this.props;
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
        <Card title="Profile Details"
          extra={
            <Fragment>
              <UserCan noManager>
                <Button
                  type="primary"
                  onClick={this.handleEnrollInMfa}
                  style={{ marginRight: 10 }}
                  disabled={mfaEnrollmentStatus}
                >
                  { (!mfaEnrollmentStatus && "Enroll In 2FA") || "Enrolled In 2FA" }
                </Button>
              </UserCan>
              <Button
                type="danger"
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_LOGOUT", { "email": email})
                  logOut()
                }}
              >
                Log Out
              </Button>
            </Fragment>
          }
        >
          <Descriptions bordered column={4}>
            <Descriptions.Item span ={4} label="Your Email is">{email}</Descriptions.Item>
          </Descriptions>
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
    mfaEnrollmentStatus: state.auth.mfaEnrollmentStatus,
    socket: state.apollo.socket,
    currentOrganizationId: state.organization.currentOrganizationId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, generateKey, deleteKey, getMfaStatus }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(Profile, ALL_API_KEYS, props => ({ fetchPolicy: 'cache-and-network', variables: {}, name: 'apiKeysQuery' }))
)
