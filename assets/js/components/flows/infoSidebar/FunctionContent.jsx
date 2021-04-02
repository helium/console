import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withGql from '../../../graphql/withGql'
import { PauseOutlined, CaretRightOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
const { Text } = Typography;
import UserCan from '../../common/UserCan'
import FunctionDetailsCard from '../../functions/FunctionDetailsCard';
import { FUNCTION_SHOW } from '../../../graphql/functions'
import { deleteFunction, updateFunction } from '../../../actions/function';
import analyticsLogger from '../../../util/analyticsLogger'
import FunctionValidator from '../../functions/FunctionValidator';
import DeleteFunctionModal from '../../functions/DeleteFunctionModal';
import moment from 'moment'
import { Link } from 'react-router-dom';

class FunctionContent extends Component {
  state = {
    name: "",
    type: undefined,
    format: undefined,
    body: "",
    codeUpdated: false,
    showDeleteFunctionModal: false,
  }

  componentDidMount() {
    const functionId = this.props.id
    analyticsLogger.logEvent("ACTION_FUNCTION_INFO_SIDEBAR", {"id": functionId})

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
    const functionId = this.props.id
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
    const { loading, error } = this.props.functionShowQuery;
    const fxn = this.props.functionShowQuery.function;

    if (loading) return null; // TODO skeleton
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    );

    return (
      <React.Fragment>
        <Text style={{ fontSize: 30, fontWeight: 'bold', display: 'block' }}>{fxn.name}</Text>
        <Text style={{ fontWeight: 'bold' }}>Last Modified: </Text><Text>{moment.utc(fxn.updated_at).local().format('l LT')}</Text>
        <UserCan>
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <Button
              style={{ borderRadius: 4, marginRight: 5 }}
              type="default"
              icon={fxn.active ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={() => {
                this.props.updateFunction(fxn.id, { active: !fxn.active })
                analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_ACTIVE", { "id": fxn.id, "active": !fxn.active })
              }}
            >
              {fxn.active ? "Pause" : "Start"}
            </Button>
            <Link to={`/functions/${this.props.id}`}>
              <Button
                style={{ borderRadius: 4, marginRight: 5 }}
                icon={<EditOutlined />}
                onClick={e => {
                  // e.stopPropagation()
                  // redirect to show page
                }}
              >
                Edit
              </Button>
            </Link>
            <Button
              style={{ borderRadius: 4 }}
              type="danger"
              icon={<DeleteOutlined />}
              onClick={e => {
                e.stopPropagation()
                this.openDeleteFunctionModal()
              }}
            >
              Delete
            </Button>
          </div>
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
          />
        </UserCan>

        {/* TODO fix the function validator being squished into the sidebar */}
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
      </React.Fragment>
    );
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
  withGql(FunctionContent, FUNCTION_SHOW, props => ({ fetchPolicy: 'cache-first', variables: { id: props.id }, name: 'functionShowQuery' }))
)