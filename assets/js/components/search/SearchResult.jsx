import React, { Component } from 'react'
import { Typography } from 'antd';
import { EnterOutlined, AppstoreOutlined, ApiOutlined, UserOutlined, DashboardOutlined, ProfileOutlined, WalletOutlined, CaretRightOutlined } from '@ant-design/icons';
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
        Go <EnterOutlined style={{ fontSize: 18 }}/>
      </span>
    }
  </span>
)

const SearchResultIcon = (props) => {
  switch (props.category) {
    case "devices":
      return <AppstoreOutlined style={{ fontSize: 18, marginRight: 20 }}/>
    case "channels":
      return <ApiOutlined style={{ fontSize: 18, marginRight: 20 }}/>
    case "users":
      return <UserOutlined style={{ fontSize: 18, marginRight: 20 }}/>
    case "dashboard":
      return <DashboardOutlined style={{ fontSize: 18, marginRight: 20 }}/>
    case "profile":
      return <ProfileOutlined style={{ fontSize: 18, marginRight: 20 }}/>
    case "datacredits":
      return <WalletOutlined style={{ fontSize: 18, marginRight: 20 }}/>
    default:
      return <CaretRightOutlined style={{ fontSize: 18, marginRight: 20 }}/>
  }
}

export default SearchResult
