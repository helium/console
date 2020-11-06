import React from 'react';
import { Skeleton } from 'antd';
import { Card } from 'antd';

export const IndexSkeleton = props => {
    return (
      <Card title={props.title || ''}>
          <Skeleton title={false} paragraph={{ rows: 5 }} active />
      </Card>
    );
};