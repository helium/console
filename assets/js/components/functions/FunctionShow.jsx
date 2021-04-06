import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withGql from '../../graphql/withGql'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import FunctionValidator from './FunctionValidator'
import DeleteFunctionModal from './DeleteFunctionModal'
import { FUNCTION_SHOW } from '../../graphql/functions'
import { deleteFunction, updateFunction } from '../../actions/function'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Card, Button, Input, Select } from 'antd';
import { PauseOutlined, DeleteOutlined, SaveOutlined, CaretRightOutlined } from '@ant-design/icons';
import { FunctionShowSkeleton } from './FunctionShowSkeleton';
const { Text } = Typography
const { Option } = Select
import FunctionDetailsCard from './FunctionDetailsCard';

class FunctionShow extends Component {
  state = {
    name: "",
    type: undefined,
    format: undefined,
    body: "",
    codeUpdated: false,
    showDeleteFunctionModal: false,
  }

  componentDidMount() {
    const functionId = this.props.match.params.id
    analyticsLogger.logEvent("ACTION_NAV_FUNCTION_SHOW", {"id": functionId})

    const { socket } = this.props

    this.channel = socket.channel("graphql:function_show", {})
    this.channel.join()
    this.channel.on(`graphql:function_show:${functionId}:function_update`, (message) => {
      this.props.functionShowQuery.refetch()
    })
  }

  componentWillUnmount() {
    this.channel.leave()
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
    const fxn = this.props.functionShowQuery.function

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

  openDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: true })
  }

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false })
  }

  render() {
    const {name, type, format, body, codeUpdated, showDeleteFunctionModal } = this.state
    const { loading, error } = this.props.functionShowQuery
    const fxn = this.props.functionShowQuery.function

    if (loading) return <FunctionShowSkeleton user={this.props.user}/>
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
                this.openDeleteFunctionModal()
              }}
            >
              Delete Function
            </Button>
          </UserCan>
        }
      >
        <FunctionDetailsCard
          fxn={fxn}
          name={name}
          type={type}
          format={format}
          body={body}
          handleSelectFunctionType={this.handleSelectFunctionType}
          handleInputUpdate={this.handleInputUpdate}
          handleSelectFormat={this.handleSelectFormat}
          clearInputs={this.clearInputs}
          handleSubmit={this.handleSubmit}
          horizontal={true}
        />
        {
          (format === 'custom' || (fxn.format === 'custom' && !format)) && (
            <FunctionValidator
              handleFunctionUpdate={this.handleFunctionUpdate}
              body={(body === "" && !codeUpdated) ? fxn.body : body}
              title="Custom Script"
            />
          )
        }

        <DeleteFunctionModal
          open={showDeleteFunctionModal}
          onClose={this.closeDeleteFunctionModal}
          functionToDelete={fxn}
          redirect
        />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteFunction, updateFunction }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(FunctionShow, FUNCTION_SHOW, props => ({ fetchPolicy: 'cache-first', variables: { id: props.match.params.id }, name: 'functionShowQuery' }))
)
