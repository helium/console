import React, { Component } from 'react';
import { Skeleton } from 'antd';
import DashboardLayout from '../common/DashboardLayout';
import { Card, Row, Col } from 'antd';

class DeviceShowSkeleton extends Component {
  render() {
    return (
      <DashboardLayout>
        <Skeleton title={true} paragraph={{ rows: 0 }} active />
        <Row gutter={{ xs: 4, sm: 8, md: 12, lg: 16 }} type="flex" >
          <Col span={15}>
            <Card>
              <Skeleton title={false} paragraph={{ rows: 9 }} active />
            </Card>
          </Col>
          <Col span={9}>
            <Card>
              <Skeleton title={false} paragraph={{ rows: 4 }} active />
            </Card>
          </Col>
        </Row>
        <Card>
          <Skeleton title={false} paragraph={{ rows: 10 }} active />
        </Card>
      </DashboardLayout>
    )
  }
};

export default DeviceShowSkeleton;