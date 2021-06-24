import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'antd';
import Text from 'antd/lib/typography/Text';
import { minWidth } from '../../util/constants'
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
      dataIndex: 'value',
      render: data => (
        data === 10 ? "All Available" : "Up to " + data
      )
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
    <div className="no-scroll-bar" style={{ overflowX: 'scroll'}}>
      <div style={{ padding: '30px 20px 20px 30px', minWidth }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>All Multiple Packet Configs</Text>
      </div>
      <Table
        dataSource={props.data}
        columns={columns}
        rowKey={record => record.id}
        pagination={false}
        style={{ minWidth, overflowX: 'scroll', overflowY: 'hidden' }}
        onRow={(record, rowIndex) => ({
          onClick: e => {
            if (e.target.tagName === 'TD') {
              props.history.push(`/multi_buys/${record.id}`)
            }
          }
        })}
      />
    </div>
  );
}
