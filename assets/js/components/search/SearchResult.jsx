import React, { Component } from 'react'
import { Icon, Typography } from 'antd';

const { Text } = Typography

class SearchResult extends Component {
  render() {
    const { selected, result, gotoResult } = this.props
    return (
      <div
        onClick={() => gotoResult(result)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: selected ? '#E3F2FD' : 'white',
          padding: 15,
          borderRadius: 4,

        }}
        className="result"
      >
        { false && <SearchResultIcon category={result.category} /> }
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong>{result.title}</Text>
          <Text type="secondary">{result.description}</Text>
        </div>
        <div style={{ flexGrow: 1 }} />
        <JumpTo show={selected} />

      </div>
    )
  }
}

const JumpTo = (props) => (
  <span className="jumpto">
    {props.show &&
      <span className="jumpto--inner">
        Go <Icon type="enter" style={{ fontSize: 18 }}/>
      </span>
    }
  </span>
)

const SearchResultIcon = (props) => {
  switch (props.category) {
    case "devices":
      return <Icon type="appstore" style={{ fontSize: 18, marginRight: 20 }}/>
    case "channels":
      return <Icon type="api" style={{ fontSize: 18, marginRight: 20 }}/>
    case "users":
      return <Icon type="user" style={{ fontSize: 18, marginRight: 20 }}/>
    case "dashboard":
      return <Icon type="dashboard" style={{ fontSize: 18, marginRight: 20 }}/>
    case "profile":
      return <Icon type="profile" style={{ fontSize: 18, marginRight: 20 }}/>
    case "datacredits":
      return <Icon type="wallet" style={{ fontSize: 18, marginRight: 20 }}/>
    default:
      return <Icon type="caret-right" style={{ fontSize: 18, marginRight: 20 }}/>
  }
}

export default SearchResult
