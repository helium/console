import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { PageHeader } from 'antd';

@withRouter
class ContentLayout extends Component {
  render() {
    const { title, extra, breadCrumbs, noHeaderPadding } = this.props

    return (
      <div style={{padding: 30}}>
        {breadCrumbs}
        <PageHeader
          backIcon={false}
          title={title}
          subTitle=""
          extra={extra}
          style={{ paddingRight: 3, paddingBottom: noHeaderPadding ? 0 : 30 }}
        />
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ContentLayout
