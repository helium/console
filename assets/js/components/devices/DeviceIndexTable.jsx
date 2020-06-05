import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { redForTablesDeleteText } from '../../util/colors'
import DevicesImg from '../../../img/devices.svg'

import classNames from 'classnames';
import { Table, Button, Empty, Pagination, Typography, Select, Card } from 'antd';
const { Text } = Typography
const { Option } = Select

class DeviceIndexTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
    selectedRows: [],
  }

  handleSelectOption = (value) => {
    if (value === 'addLabel') {
      this.props.openDevicesAddLabelModal(this.state.selectedRows)
    } else if (value === 'removeAllLabels') {
      this.props.openDeviceRemoveAllLabelsModal(this.state.selectedRows)
    } else {
      this.props.openDeleteDeviceModal(this.state.selectedRows)
    }
  }

  handleChangePage = (page) => {
    this.setState({ selectedRows: [] });
    this.props.handleChangePage(page);
  }

  render() {
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
        render: (text, record) => <Link to={`/devices/${record.id}`}>{text}</Link>
      },
      {
        title: 'Device EUI',
        dataIndex: 'dev_eui',
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (labels, record) => {
          return <React.Fragment>
            {
              labels.map(l => (
                <UserCan
                  key={l.id}
                  alternate={
                    <LabelTag
                      key={l.name}
                      text={l.name}
                      color={l.color}
                      hasIntegrations={l.channels.length > 0}
                      hasFunction={l.function}
                    />
                  }
                >
                  <LabelTag
                    key={l.name}
                    text={l.name}
                    color={l.color}
                    closable
                    hasIntegrations={l.channels.length > 0}
                    hasFunction={l.function}
                    onClose={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      this.props.openDevicesRemoveLabelModal([l], record)
                    }}
                  />
                </UserCan>
              ))
            }
          </React.Fragment>
        }
      },
      {
        title: 'Integrations',
        dataIndex: 'channels',
        render: (text, record) => (
          <div>
            {
              record.channels.map((c, i) => <Text key={c.id}>{c.name}{i != record.channels.length - 1 && ", "}</Text>)
            }
          </div>
        )
      },
      {
        title: 'Frame Up',
        dataIndex: 'frame_up',
      },
      {
        title: 'Frame Down',
        dataIndex: 'frame_down',
      },
      {
        title: 'Packets Transferred',
        dataIndex: 'total_packets',
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: 'Last Connected',
        dataIndex: 'last_connected',
        render: data => data ? moment.utc(data).local().format('lll') : ""
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div>
            <UserCan>
              <Button
                type="danger"
                icon="delete"
                shape="circle"
                onClick={e => {
                  e.stopPropagation()
                  this.props.openDeleteDeviceModal([record])
                }}
              />
            </UserCan>
          </div>
        )
      },
    ]

    const { noDevicesButton, devices } = this.props;

    const rowSelection = {
      onChange: (keys, selectedRows) => this.setState({ selectedRows })
    }

    return (
      <div>
        {
          devices.entries.length === 0 && (
            <div className="blankstateWrapper">
            <div className="message">
              <img src={DevicesImg} />
              <h1>No Devices</h1>
              <p>You haven’t added any devices yet.</p>
              { noDevicesButton() }
            </div>
            <style jsx>{`

                .message {

                  width: 100%;
                  max-width: 500px;
                  margin: 0 auto;
                  text-align: center;

                }

                h1, p  {

                  color: #242425;
                }
                h1 {
                  font-size: 46px;
                  margin-bottom: 10px;
                }
                p {
                  font-size: 20px;
                  font-weight: 300;
                }


                .blankstateWrapper {
                  width: 100%;
                  padding-top: 200px;
                  margin: 0 auto;
                  position: relative;
                  padding-bottom: 200px;


                }
              `}</style>
            </div>
          )
        }
        {
          devices.entries.length > 0 && (
            <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${devices.totalEntries} Devices`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 270, marginRight: 10 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="addLabel" disabled={this.state.selectedRows.length == 0}>Add Label to Selected Devices</Option>
              <Option value="removeAllLabels" disabled={this.state.selectedRows.length == 0}>Remove All Labels From Selected Devices</Option>
              <Option value="delete" disabled={this.state.selectedRows.length == 0} style={{ color: redForTablesDeleteText }}>Delete Selected Devices</Option>
            </Select>
          </UserCan>
        }
      >
            <React.Fragment>
              <Table
                columns={columns}
                dataSource={devices.entries}
                rowKey={record => record.id}
                pagination={false}
                rowSelection={rowSelection}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
                <Pagination
                  current={devices.pageNumber}
                  pageSize={devices.pageSize}
                  total={devices.totalEntries}
                  onChange={page => this.handleChangePage(page)}
                  style={{marginBottom: 20}}
                />
              </div>
            </React.Fragment>
            </Card>
          )
        }
      </div>
    )
  }
}

export default DeviceIndexTable
