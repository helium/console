import React, { Component } from "react";
import { withRouter } from "react-router";
import { PageHeader } from "antd";

@withRouter
class ContentLayout extends Component {
  render() {
    const { title, extra, breadCrumbs, noHeaderPadding, full } = this.props;

    return (
      <div
        style={{
          padding: 30,
          paddingBottom: full ? 55 : 30,
          height: full ? "100%" : "auto",
          minHeight: "100%",
          backgroundColor: "#F5F7F9",
        }}
      >
        {breadCrumbs}
        <PageHeader
          backIcon={false}
          title={title}
          subTitle=""
          extra={extra}
          style={{ paddingRight: 3, paddingBottom: noHeaderPadding ? 0 : 30 }}
        />
        {this.props.children}
      </div>
    );
  }
}

export default ContentLayout;
