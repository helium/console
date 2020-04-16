import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import FunctionValidator from './FunctionValidator'
import DeleteFunctionModal from './DeleteFunctionModal'
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

const functionTypes = {
  decoder: "Decoder"
}

const functionFormats = {
  cayenne: "Cayenne LPP",
  custom: "Custom Script"
}

@connect(null, mapDispatchToProps)
@graphql(FUNCTION_SHOW, queryOptions)
class FunctionShow extends Component {
  state = {
    name: "",
    type: undefined,
    format: undefined,
    body: "",
    showDeleteFunctionModal: false,
    functionToDelete: null,
    codeUpdated: false,
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

  handleInputUpdate = e => this.setState({ name: e.target.value })

  handleSelectFunctionType = () => this.setState({ type: "decoder" })

  handleSelectFormat = format => {
    if (format === 'custom') this.setState({ format, codeUpdated: true })
    else this.setState({ format })
  }

  handleFunctionUpdate = body => this.setState({ body, codeUpdated: true })

  handleSubmit = () => {
    const {name, type, format, body} = this.state
    const functionId = this.props.match.params.id
    const fxn = this.props.data.function

    const newAttrs = {}

    if (name.length > 0) newAttrs.name = name
    if (type) newAttrs.type = type
    if (format) newAttrs.format = format
    if (format === 'custom' || (fxn.format === 'custom' && !format)) newAttrs.body = body
    this.props.updateFunction(functionId, newAttrs)

    analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_DETAILS", { "id": functionId, attrs: newAttrs })
  }

  clearInputs = () => {
    this.setState({
      name: "",
      type: undefined,
      format: undefined,
      body: "",
      codeUpdated: false
    })
  }

  openDeleteFunctionModal = (functionToDelete) => {
    this.setState({ showDeleteFunctionModal: true, functionToDelete })
  }

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false })
  }

  render() {
    const {name, type, format, body, codeUpdated, showDeleteFunctionModal} = this.state
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
                this.openDeleteFunctionModal(fxn)
              }}
            >
              Delete Function
            </Button>
          </UserCan>
        }
      >
        <Card title="Function Details">
          <Text>Update Function</Text>
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
            <Input
              placeholder={fxn.name}
              name="name"
              value={name}
              onChange={this.handleInputUpdate}
              style={{ width: 220 }}
            />
            <Select
              placeholder={functionTypes[fxn.type]}
              onSelect={this.handleSelectFunctionType}
              style={{ width: 220, marginLeft: 8 }}
              value={type}
            >
              <Option value="decoder">
                Decoder
              </Option>
            </Select>
            <Select
              placeholder={functionFormats[fxn.format]}
              onSelect={this.handleSelectFormat}
              style={{ width: 220, marginLeft: 8 }}
              value={format}
            >
              <Option value="cayenne">
                Cayenne LPP
              </Option>
              <Option value="custom">
                Custom Script
              </Option>
            </Select>
            <Button
              icon="delete"
              onClick={this.clearInputs}
              style={{ marginLeft: 8 }}
            >
              Clear
            </Button>
          </div>

        </Card>
        {
          (format === 'custom' || (fxn.format === 'custom' && !format)) && (
            <FunctionValidator
              handleFunctionUpdate={this.handleFunctionUpdate}
              body={(body === "" && !codeUpdated) ? fxn.body : body}
              title="Custom Script"
            />
          )
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
              disabled={!type && !format && name.length === 0 && body.length === 0}
            >
              Save Changes
            </Button>
          </UserCan>
        </div>

        <DeleteFunctionModal
          open={showDeleteFunctionModal}
          onClose={this.closeDeleteFunctionModal}
          functionToDelete={this.state.functionToDelete}
          redirect
        />
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteFunction, updateFunction }, dispatch);
}

export default FunctionShow
