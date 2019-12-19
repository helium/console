import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { PageHeader } from 'antd';

@withRouter
class ContentLayout extends Component {
  render() {
    const { title } = this.props

    return (
      <div>
        <PageHeader
          backIcon={false}
          title={title}
          subTitle=""
        />
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ContentLayout
