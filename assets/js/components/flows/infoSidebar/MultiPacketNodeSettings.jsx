import React from 'react';
import { useDispatch } from "react-redux";
import { useQuery } from '@apollo/client';
import { addMultiBuyToNode, removeMultiBuyFromNode } from '../../../actions/multiBuy';
import { ALL_MULTI_BUYS } from '../../../graphql/multiBuys';
import { SkeletonLayout } from '../../common/SkeletonLayout';
import { Switch, Typography, Table } from 'antd';
import { Link } from 'react-router-dom';
import UserCan from '../../common/UserCan';
const { Text } = Typography

export default ({ currentNode }) => {
  const dispatch = useDispatch();

  const { loading, error, data } = useQuery(ALL_MULTI_BUYS, { fetchPolicy: 'cache-first' });
  if (loading) return (<div style={{ padding: '20px 40px 0px 40px' }}><SkeletonLayout /></div>);
  if (error) return (<div style={{ padding: '20px 40px 0px 40px' }}><Text>Data failed to load, please reload the page and try again</Text></div>);

  return (
    <div style={{ padding: '0px 40px 0px 40px' }}>
      <Table
        dataSource={data.allMultiBuys}
        rowKey={record => record.id}
        pagination={false}
        columns={[
          {
            title: '',
            dataIndex: 'name',
            render: (data, record) => (
              <Link to={`/multi_buys/${record.id}`}>{data}</Link>
            )
          },
          {
            title: '',
            dataIndex: '',
            render: (text, record) => (
              <UserCan>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <Switch
                    checked={currentNode.multi_buy_id === record.id}
                    onChange={checked => {
                      if (checked) {
                        dispatch(addMultiBuyToNode(record.id, currentNode.id, currentNode.__typename))
                      } else {
                        dispatch(removeMultiBuyFromNode(currentNode.id, currentNode.__typename))
                      }
                    }}
                  />
                </div>
              </UserCan>
            )
          }
        ]}
      />
    </div>
  )
}
