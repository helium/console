import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import FunctionValidator from './FunctionValidator'
import { FUNCTION_SHOW, FUNCTION_UPDATE_SUBSCRIPTION } from '../../graphql/functions'
import { deleteFunction, updateFunction } from '../../actions/function'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Card, Button, Input, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(FUNCTION_SHOW, queryOptions)
class FunctionShow extends Component {
  state = {
    name: "",
    type: null,
    format: null,
    body: ""
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data
    const functionId = this.props.match.params.id
    analyticsLogger.logEvent("ACTION_NAV_FUNCTION_SHOW", {"id": functionId})

    subscribeToMore({
      document: FUNCTION_UPDATE_SUBSCRIPTION,
      variables: { functionId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.data.function && this.props.data.function) {
      const {name, body, type, format} = this.props.data.function
      this.setState({ name, body, type, format })
    }
  }

  handleInputUpdate = e => this.setState({ [e.target.name]: e.target.value })

  handleSelectFunctionType = () => this.setState({ type: "decoder" })

  handleSelectFormat = format => this.setState({ format })

  handleFunctionUpdate = body => this.setState({ body })

  handleSubmit = () => {
    const {name, type, format, body} = this.state
    // this.props.createFunction({
    //   name,
    //   type,
    //   format,
    //   body
    // })
  }

  render() {
    const {name, type, format, body} = this.state
    const { loading, error } = this.props.data
    const fxn = this.props.data.function

    if (loading) return <DashboardLayout />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <DashboardLayout
        title={`${fxn.name}`}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
            <Link to="/functions"><Text style={{ color: "#8C8C8C" }}>Functions&nbsp;&nbsp;/</Text></Link>
            <Text>&nbsp;&nbsp;{fxn.name}</Text>
          </div>
        }
        extra={
          <UserCan>
            <Button
              size="large"
              type="default"
              icon={fxn.active ? "pause" : "caret-right"}
              onClick={() => {
                this.props.updateFunction(fxn.id, { active: !fxn.active })
                analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_ACTIVE", { "id": fxn.id, "active": !fxn.active })
              }}
            >
              {fxn.active ? "Pause" : "Start"} Function
            </Button>
            <Button
              size="large"
              type="danger"
              icon="delete"
              onClick={e => {
                e.stopPropagation()
                this.props.deleteFunction(fxn.id, true)
              }}
            >
              Delete Function
            </Button>
          </UserCan>
        }
      >
        <Card title="Step 1 - Enter Function Details">
          <Text>Enter Function Name</Text>
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
            <Input
              placeholder="e.g. My Decoder"
              name="name"
              value={name}
              onChange={this.handleInputUpdate}
              style={{ width: 220 }}
            />
            <Select
              placeholder="Function Type"
              onSelect={this.handleSelectFunctionType}
              style={{ width: 220, marginLeft: 8 }}
            >
              <Option value="decoder">
                Decoder
              </Option>
            </Select>
            <Select
              placeholder="Choose Format"
              onSelect={this.handleSelectFormat}
              style={{ width: 220, marginLeft: 8 }}
              disabled={!type}
            >
              <Option value="cayenne">
                Cayenne LPP
              </Option>
              <Option value="custom">
                Custom Script
              </Option>
            </Select>
          </div>
        </Card>
        {
          type && format === 'custom' && <FunctionValidator handleFunctionUpdate={this.handleFunctionUpdate} body={body} />
        }

        <UserCan>
          <Card title="Labels Applied To">
          </Card>
        </UserCan>

        <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row' }}>
          <UserCan>
            <Button
              size="large"
              icon="save"
              type="primary"
              onClick={this.handleSubmit}
              disabled={!type || !format || name.length === 0}
            >
              Save Changes
            </Button>
          </UserCan>
        </div>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteFunction, updateFunction }, dispatch);
}

export default FunctionShow
