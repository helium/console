import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import { Checkbox, Input, Card, Icon, AutoComplete } from 'antd';
import { graphql } from 'react-apollo';
import { SEARCH_DEVICES } from '../../graphql/search'

class LabelAddDeviceSelect extends Component {
  constructor(props) {
    super(props)

    this.state = {
      searchDevices: []
    }

    this.runSearch = this.runSearch.bind(this)
  }

  runSearch(value) {
    const { data } = this.props
    if (!data.loading) {
      data.fetchMore({
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
      data
    } = this.props

    const { searchDevices } = this.state

    const debouncedSearch = debounce(this.runSearch, 300)

    return (
      <Card title={<Checkbox onChange={e => checkAllDevices(searchDevices)} checked={allDevices.length === Object.keys(checkedDevices).length}>Select All Devices</Checkbox>} size="small" style={{ height: 200 }}>
        <Input
          placeholder="Search here"
          suffix={<Icon type="search" />}
          onChange={e => debouncedSearch(e.target.value)}
          style={{ width: 200, marginBottom: 10 }}
        />
        <div style={{ overflow: 'scroll', height: 102 }}>
          {
            searchDevices.length === 0 && allDevices.map(d => (
              <div style={{ marginTop: 5 }} key={d.id}>
                <Checkbox onChange={() => checkSingleDevice(d.id)} checked={checkedDevices[d.id]}>{d.name}</Checkbox>
                {
                  labelNormalizedDevices[d.id] && <Icon type="check-circle" theme="filled" style={{ color: "#4091F7" }} />
                }
              </div>
            ))
          }
          {
            searchDevices.map(d => (
              <div style={{ marginTop: 5 }} key={d.id}>
                <Checkbox onChange={() => checkSingleDevice(d.id)} checked={checkedDevices[d.id]}>{d.name}</Checkbox>
                {
                  labelNormalizedDevices[d.id] && <Icon type="check-circle" theme="filled" style={{ color: "#4091F7" }} />
                }
              </div>
            ))
          }
        </div>
      </Card>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

export default graphql(SEARCH_DEVICES, queryOptions)(LabelAddDeviceSelect)
