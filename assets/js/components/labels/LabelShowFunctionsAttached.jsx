import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router';
import { DeleteOutlined } from '@ant-design/icons';
import { Typography, Button, Card, Select } from 'antd';
import { ALL_FUNCTIONS } from '../../graphql/functions'
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
    selectedFunction: null
  }

  selectFunction = id => {
    this.setState({ selectedFunction: id })
  }

  render() {
    const { func } = this.props
    const { selectedFunction } = this.state
    const { allFunctions } = this.props.data

    return (
      <div>
        <Card title="Added Function (Only 1 Allowed)">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ borderRight: "1px solid #e1e4e8", marginRight: 20, height: 75 }}>
              <Text style={{ display: 'block' }}>Add a Function</Text>

              <Select
                value={selectedFunction}
                onChange={this.selectFunction}
                style={{ width: 220 }}
              >
                {
                  allFunctions && allFunctions.map(f => (
                    <Option value={f.id} key={f.id}>{f.name}</Option>
                  ))
                }
              </Select>
              <Button style={{ marginLeft: 8, marginRight: 20 }}>
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
                    <Button size="small" type="danger" shape="circle" icon={<DeleteOutlined />} style={{ marginLeft: 8 }}/>
                  </span>
                )
              }
            </div>
          </div>
        </Card>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default LabelShowFunctionsAttached
