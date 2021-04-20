import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import Text from 'antd/lib/typography/Text';

export default () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const columns = [
    {
      title: 'Alert Name',
      dataIndex: 'name',
      render: (text, record) => (
        <Link to={`/alerts/${record.id}`}>{text}</Link>
      )
    },
    {
      title: 'Alert Type'
    },
    {
      title: 'Times Alerted'
    },
    {
      title: 'Last Time Alerted'
    }
  ];

  return (
    <Fragment>
      <div style={{ padding: '30px 20px 20px 30px' }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>All Alerts</Text>
      </div>
      <Table
        columns={columns}
        rowSelection={{
          onChange: (keys, selectedRows) => {
            setSelectedRows(selectedRows);
            setAllSelected(false);
          },
          onSelectAll: () => { setAllSelected(!allSelected) }
        }}
      />
    </Fragment>
  );
}