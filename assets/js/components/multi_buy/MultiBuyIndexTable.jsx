import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'antd';
import Text from 'antd/lib/typography/Text';
import moment from 'moment';
import { DeleteOutlined } from '@ant-design/icons';
import UserCan from '../common/UserCan';

export default (props) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (data, record) => (
        <Link to={`/multi_buys/${record.id}`}>{data}</Link>
      )
    },
    {
      title: 'Multiple Packet Value',
      dataIndex: 'value'
    },
    {
      title: '',
      dataIndex: '',
      render: (text, record) => (
        <UserCan>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              shape="circle"
              size="small"
              onClick={e => {
                e.stopPropagation()
                props.openDeleteMultiplePacketModal(record);
              }}
            />
          </div>
        </UserCan>
      )
    }
  ];

  return (
    <Fragment>
      <div style={{ padding: '30px 20px 20px 30px' }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>All Multiple Packet Configs</Text>
      </div>
      <Table
        dataSource={props.data}
        columns={columns}
        rowKey={record => record.id}
        pagination={false}
      />
    </Fragment>
  );
}
