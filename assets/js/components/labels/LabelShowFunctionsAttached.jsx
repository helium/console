import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router';
import { DeleteOutlined } from '@ant-design/icons';
import { Typography, Button, Card, Select } from 'antd';
import LabelShowRemoveFunctionModal from './LabelShowRemoveFunctionModal'
import { ALL_FUNCTIONS } from '../../graphql/functions'
import { updateLabel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(ALL_FUNCTIONS, queryOptions)
class LabelShowFunctionsAttached extends Component {
  state = {
    selectedFunction: null,
    showRemoveFunctionModal: false,
    functionToDelete: null
  }

  selectFunction = id => {
    this.setState({ selectedFunction: id })
  }

  openRemoveFunctionModal = (functionToDelete) => {
    this.setState({ showRemoveFunctionModal: true, functionToDelete })
  }

  closeRemoveFunctionModal = () => {
    this.setState({ showRemoveFunctionModal: false })
  }

  addFunctionToLabel = () => {
    this.props.updateLabel(this.props.label.id, { function_id: this.state.selectedFunction })
    analyticsLogger.logEvent("ACTION_ADD_FUNCTION_TO_LABEL", { "function_id": this.state.selectedFunction, "label_id": this.props.label.id })
  }

  render() {
    const { func, label } = this.props
    const { selectedFunction, showRemoveFunctionModal, functionToDelete } = this.state
    const { allFunctions } = this.props.data

    return (
      <div>
        <Card title="Added Function (Only 1 Allowed)">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ borderRight: "1px solid #e1e4e8", marginRight: 20, height: 75, minWidth: 310 }}>
              <Text style={{ display: 'block' }}>Add a Function</Text>

              <Select
                value={selectedFunction}
                onChange={this.selectFunction}
                style={{ width: 220 }}
              >
                {
                  allFunctions && allFunctions.reduce((acc, f) => {
                    if (func && f.id == func.id) return acc
                    return acc.concat(<Option value={f.id} key={f.id}>{f.name}</Option>)
                  }, [])
                }
              </Select>
              <Button
                style={{ marginLeft: 8, marginRight: 20 }}
                disabled={!selectedFunction}
                onClick={this.addFunctionToLabel}
              >
                Add
              </Button>
            </div>
            <div style={{ height: 75 }}>
              <Text style={{ display: 'block', marginBottom: 4 }}>Attached Function</Text>
              {
                func && (
                  <span>
                    <a
                      href={`/functions/${func.id}`}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.push(`/functions/${func.id}`)
                      }}
                    >
                      {func.name}
                    </a>
                    <Button
                      size="small"
                      type="danger"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      style={{ marginLeft: 8 }}
                      onClick={() => this.openRemoveFunctionModal(func)}
                    />
                  </span>
                )
              }
            </div>
          </div>
        </Card>

        <LabelShowRemoveFunctionModal
          open={showRemoveFunctionModal}
          onClose={this.closeRemoveFunctionModal}
          functionToDelete={functionToDelete}
          label={label}
        />
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push, updateLabel }, dispatch)
}

export default LabelShowFunctionsAttached
