import React from 'react';
import { Skeleton } from 'antd';
import { Card } from 'antd';

export const IndexSkeleton = () => {
    return (
      <Card>
          <Skeleton title={false} paragraph={{ rows: 5 }} active />
      </Card>
    );
};