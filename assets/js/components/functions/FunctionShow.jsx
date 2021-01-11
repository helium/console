import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import LabelsAppliedExisting from '../common/LabelsAppliedExisting'
import FunctionValidator from './FunctionValidator'
import DeleteFunctionModal from './DeleteFunctionModal'
import RemoveFunctionLabelModal from './RemoveFunctionLabelModal'
import { FUNCTION_SHOW, FUNCTION_UPDATE_SUBSCRIPTION } from '../../graphql/functions'
import { deleteFunction, updateFunction } from '../../actions/function'
import { updateLabel, createLabel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Card, Button, Input, Select } from 'antd';
import { PauseOutlined, DeleteOutlined, SaveOutlined, CaretRightOutlined } from '@ant-design/icons';
import { FunctionShowSkeleton } from './FunctionShowSkeleton';
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
  browan_object_locator: "Browan Object Locator",
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
    codeUpdated: false,
    showDeleteFunctionModal: false,
    showRemoveFunctionLabelModal: false,
    functionSelected: null,
    labelToRemove: null,
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

  openDeleteFunctionModal = (functionSelected) => {
    this.setState({ showDeleteFunctionModal: true, functionSelected })
  }

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false })
  }

  openRemoveFunctionLabelModal = (labelToRemove) => {
    const fxn = this.props.data.function
    this.setState({ showRemoveFunctionLabelModal: true, functionSelected: fxn, labelToRemove })
  }

  closeRemoveFunctionLabelModal = () => {
    this.setState({ showRemoveFunctionLabelModal: false })
  }

  updateLabelFunction = (label_id) => {
    const function_id = this.props.match.params.id
    this.props.updateLabel(label_id, { function_id })
    analyticsLogger.logEvent("ACTION_ADD_EXISTING_LABEL_TO_FUNCTION", { "function_id": function_id, "label_id": label_id })
  }

  createLabelAttachFunction = (name) => {
    const function_id = this.props.match.params.id
    this.props.createLabel({ name, function_id }, false)
    analyticsLogger.logEvent("ACTION_ADD_NEW_LABEL_TO_FUNCTION", { "function_id": function_id, "label_name": name })
  }

  render() {
    const {name, type, format, body, codeUpdated, showDeleteFunctionModal, showRemoveFunctionLabelModal} = this.state
    const { loading, error } = this.props.data
    const fxn = this.props.data.function

    if (loading) return <FunctionShowSkeleton />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <DashboardLayout
        user={this.props.user}
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
              style={{ borderRadius: 4 }}
              type="default"
              icon={fxn.active ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={() => {
                this.props.updateFunction(fxn.id, { active: !fxn.active })
                analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_ACTIVE", { "id": fxn.id, "active": !fxn.active })
              }}
            >
              {fxn.active ? "Pause" : "Start"} Function
            </Button>
            <Button
              size="large"
              style={{ borderRadius: 4 }}
              type="danger"
              icon={<DeleteOutlined />}
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
        <Card

 title="Function Details">
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
              <Option value="browan_object_locator">
                Browan Object Locator
              </Option>
              <Option value="cayenne">
                Cayenne LPP
              </Option>
              <Option value="custom">
                Custom Script
              </Option>
            </Select>
            <Button
              icon={<DeleteOutlined />}
              onClick={this.clearInputs}
              style={{ marginLeft: 8 }}
            >
              Clear
            </Button>
          </div>

          <UserCan>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={this.handleSubmit}
              disabled={!type && !format && name.length === 0 && body.length === 0}
              style={{ marginTop: 20 }}
            >
              Save Changes
            </Button>
          </UserCan>
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
          <Card
            title="Labels Applied To">
            <Text style={{marginBottom: 20, display: 'block'}}>Labels are necessary to apply Functions to devices</Text>

            <LabelsAppliedExisting
              labels={fxn.labels}
              updateLabelFunction={this.updateLabelFunction}
              createLabelAttachFunction={this.createLabelAttachFunction}
              openRemoveFunctionLabelModal={this.openRemoveFunctionLabelModal}
              current_function={fxn}
            />
          </Card>
        </UserCan>

        <DeleteFunctionModal
          open={showDeleteFunctionModal}
          onClose={this.closeDeleteFunctionModal}
          functionToDelete={this.state.functionSelected}
          redirect
        />

        <RemoveFunctionLabelModal
          open={showRemoveFunctionLabelModal}
          onClose={this.closeRemoveFunctionLabelModal}
          functionSelected={this.state.functionSelected}
          labelToRemove={this.state.labelToRemove}
        />
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteFunction, updateFunction, updateLabel, createLabel }, dispatch);
}

export default FunctionShow
