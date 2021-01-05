import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import { Checkbox, Input, Card, AutoComplete } from 'antd';
import { SearchOutlined, CheckCircleFilled } from '@ant-design/icons';
import { graphql } from 'react-apollo';
import { SEARCH_DEVICES } from '../../graphql/search'

const queryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

@graphql(SEARCH_DEVICES, queryOptions)
class LabelAddDeviceSelect extends Component {
  state = {
    searchDevices: []
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data
    if (!loading) {
      fetchMore({
        variables: { query: value },
        updateQuery: (prev, { fetchMoreResult }) => {
          const { searchDevices } = fetchMoreResult

          this.setState({ searchDevices })
        }
      })
    }
  }

  render() {
    const {
      checkAllDevices,
      allDevices,
      checkedDevices,
      checkSingleDevice,
      labelNormalizedDevices,
    } = this.props

    const { searchDevices } = this.state

    const debouncedSearch = debounce(this.runSearch, 300)

    return (
      <Card title={<Checkbox onChange={e => checkAllDevices(searchDevices)} checked={allDevices.length === Object.keys(checkedDevices).length}>Select All Devices</Checkbox>} size="small" style={{ height: 200 }}>
        <Input
          placeholder="Search here"
          suffix={<SearchOutlined />}
          onChange={e => debouncedSearch(e.target.value)}
          style={{ width: 200, marginBottom: 10 }}
        />
        <div style={{ overflow: 'scroll', height: 102 }}>
          {
            searchDevices.length === 0 && allDevices.map(d => (
              <div style={{ marginTop: 5 }} key={d.id}>
                <Checkbox onChange={() => checkSingleDevice(d.id)} checked={checkedDevices[d.id]}>{d.name}</Checkbox>
                {
                  labelNormalizedDevices[d.id] && <CheckCircleFilled style={{ color: "#4091F7" }} />
                }
              </div>
            ))
          }
          {
            searchDevices.map(d => (
              <div style={{ marginTop: 5 }} key={d.id}>
                <Checkbox onChange={() => checkSingleDevice(d.id)} checked={checkedDevices[d.id]}>{d.name}</Checkbox>
                {
                  labelNormalizedDevices[d.id] && <CheckCircleFilled style={{ color: "#4091F7" }} />
                }
              </div>
            ))
          }
        </div>
      </Card>
    )
  }
}

export default LabelAddDeviceSelect
