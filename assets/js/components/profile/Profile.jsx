import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import moment from 'moment'
import { logOut } from '../../actions/auth';
import { generateKey, deleteKey } from '../../actions/apiKeys';
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ProfileNewKeyModal from './ProfileNewKeyModal'
import RoleName from '../common/RoleName'
import analyticsLogger from '../../util/analyticsLogger'
import { ALL_API_KEYS, API_KEY_SUBSCRIPTION } from '../../graphql/apiKeys'
import { Typography, Button, Card, Descriptions, Input, Select, Table } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(mapStateToProps, mapDispatchToProps)
@graphql(ALL_API_KEYS, queryOptions)
class Profile extends Component {
  state = {
    name: "",
    role: null,
    newKey: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_PROFILE")

    const { subscribeToMore, fetchMore } = this.props.data

    subscribeToMore({
      document: API_KEY_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
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
        analyticsLogger.logEvent("ACTION_GENERATE_API_KEY", { name, role, userId: this.props.userId })
        this.setState({ newKey })
      })
  }

  handleCloseModal = () => {
    this.setState({ newKey: null })
  }

  render() {
    const { email, role } = this.props.user;
    const { logOut, authKey, data } = this.props
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
        title: 'Date Created',
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
        title: 'Created By',
        dataIndex: 'user',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <div style={{ display: 'flex', justifyContent: 'center'}}>
            <UserCan>
              <Button
                type="danger"
                icon="delete"
                shape="circle"
                onClick={() => this.props.deleteKey(record.id)}
              />
            </UserCan>
          </div>
        )
      },
    ]

    return(
      <DashboardLayout title="Profile">
        <Card title="Profile Details"
          extra={
            <Button
              type="danger"
              onClick={() => {
                analyticsLogger.logEvent("ACTION_LOGOUT", { "email": email})
                logOut()
              }}
            >
              Log Out
            </Button>
          }
        >
          <Descriptions bordered column={4}>
            <Descriptions.Item span ={4} label="Your Email is">{email}</Descriptions.Item>
            <Descriptions.Item span ={4}  label="Auth token: "><Text copyable>{authKey}</Text></Descriptions.Item>
          </Descriptions>
        </Card>

        <UserCan>
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
              data.apiKeys && (
                <div style={{ marginTop: 20, overflowX: 'scroll' }}>
                  <Table
                    columns={columns}
                    dataSource={data.apiKeys}
                    rowKey={record => record.id}
                    pagination={false}
                    bordered
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
    user: state.user,
    userId: state.auth.user.id,
    authKey: state.auth.apikey
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, generateKey, deleteKey }, dispatch)
}

export default Profile
