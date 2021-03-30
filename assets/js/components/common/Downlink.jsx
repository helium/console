import React, { Component } from 'react';
import { Card, Typography, Input, InputNumber, Row, Col, Radio, Checkbox, Tooltip, Button as RegularButton } from 'antd';
import DownlinkImage from '../../../img/downlink.svg';
import { ClearOutlined } from '@ant-design/icons';
import find from 'lodash/find'
import remove from 'lodash/remove'

const { Title, Text } = Typography;
const { Group, Button } = Radio;
const REFRESH_TIME_TO_WAIT = 600000

class Downlink extends Component {
  state = {
    port: 1,
    confirm: true,
    payloadType: 'bytes',
    payload: '',
    position: 'last',
    showRefresh: false,
    queue: []
  }

  componentDidMount() {
    const { id, src, fetchDownlinkQueue, socket } = this.props
    fetchDownlinkQueue()
    this.showRefreshTimer = setTimeout(() => this.setState({ showRefresh: true }), REFRESH_TIME_TO_WAIT)

    if (src === "DeviceShow") {
      this.channel = socket.channel("graphql:device_show_downlink", {})
      this.channel.join()
      this.channel.on(`graphql:device_show_downlink:${id}:update_queue`, ({ queue, device }) => {
        this.setState({ queue: queue.map(q => Object.assign({}, q, { device_id: device })) })
      })
    }
    if (this.props.src === "LabelShow") {
      this.channel = socket.channel("graphql:label_show_downlink", {})
      this.channel.join()
      this.channel.on(`graphql:label_show_downlink:${id}:update_queue`, ({ queue, device, label }) => {
        const cleanedQueue = remove(this.state.queue, i => i.device_id !== device)
        const updatedQueue = cleanedQueue.concat(queue.map(q => Object.assign({}, q, { device_id: device })))
        this.setState({ queue: updatedQueue })
      })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
    clearTimeout(this.showRefreshTimer)
  }

  refreshQueue = () => {
    this.props.fetchDownlinkQueue()
    this.setState({ showRefresh: false })
    this.showRefreshTimer = setTimeout(() => this.setState({ showRefresh: true }), REFRESH_TIME_TO_WAIT)
  }

  render() {
    const { src, onSend, onClear, devices } = this.props
    const { position, port, confirm, payload, payloadType } = this.state

    return (
      <div>
        <div style={{position: 'relative'}}>
          <Card style={{marginRight: 20, marginLeft: 20, marginTop: -25}}>
            <Title style={{fontSize: 22}}>Add Downlink Payload</Title>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text style={{ display: "block", marginBottom: 4 }}>Scheduling</Text>
                <Group value={position} buttonStyle="solid" onChange={el => this.setState({ position: el.target.value })}>
                  <Button value="first">First</Button>
                  <Button value="last">Last</Button>
                </Group>
              </Col>
              <Col span={12}>
                <Text style={{ display: "block", marginBottom: 4 }}>FPort</Text>
                <InputNumber style={{ width: '100%' }} defaultValue={1} min={1} max={222} onChange={port => this.setState({ port })}/>
              </Col>
            </Row>

            <div style={{ marginTop: 15 }}>
              <Text style={{ display: "block", marginBottom: 4 }}>Payload</Text>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Input placeholder="Enter Payload" onChange={(e) => this.setState({ payload: e.target.value })} style={{ marginRight: 16 }}/>

                <Tooltip title='Select bytes to send a Base64 encoded payload, or fields to have the payload Base64 encoded for you.' placement='left'>
                  <Group value={payloadType} onChange={(el) => this.setState({ payloadType: el.target.value})} buttonStyle="solid" style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button value="bytes">Bytes</Button>
                    <Button value="fields">Fields</Button>
                  </Group>
                </Tooltip>
              </div>
            </div>

            <div style={{ marginTop: 15 }}>
              <Checkbox
                checked={confirm}
                onChange={(e) => this.setState({ confirm: e.target.checked })}
                style={{ marginRight: 8}}
              />
              <Text>I'd like confirmation of response</Text>
            </div>
          </Card>
          <div style={{position: 'absolute', bottom: -16, right: 40, backgroundColor: '#40A9FF', borderRadius: 9999, width: 40, height: 40}}>
            <div style={{position: 'relative', width: '100%', height: '100%', cursor: 'pointer'}}
              onClick={() => {
                const message = payloadType === 'fields' ? Buffer.from(payload).toString('base64') : payload;
                onSend(message, confirm, port, position);
              }}
            >
              <img
                src={DownlinkImage}
                style={{height: 18, width: 24, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50% , -50%)'}}
              />
            </div>
          </div>
        </div>
        <div style={{ margin: 20 }}>
          {
            this.state.showRefresh && (
              <RegularButton
                type="primary"
                onClick={this.refreshQueue}
              >
                Refetch Queue
              </RegularButton>
            )
          }
        </div>
        <div style={{marginRight: 20, marginLeft: 20, marginTop: 25, marginBottom: 20 }}>
          <Text style={{ color: '#40A9FF', fontWeight: 500, fontSize: 18 }}>Downlink Queue: {this.state.queue.length}</Text>
        </div>
        <div style={{ height: "calc(100vh - 435px)", overflow: 'scroll' }}>
          {
            this.state.queue.map((q, index) => (
              <Card style={{marginRight: 20, marginLeft: 20 }} key={"downlink" + index}>
                <Row gutter={[16, 16]}>
                  <Col span={16}>
                    <div style={{ marginBottom: 4 }}><Text strong>Device: {find(devices, {id: q.device_id}) ? find(devices, {id: q.device_id}).name : q.device_id}</Text></div>
                    <Text>Payload</Text>
                    <Input style={{ width: '100%' }} defaultValue={q.payload} disabled/>
                  </Col>
                  <Col span={8}>
                    <div style={{ marginBottom: 4 }}><Text strong>Status: {q.confirmed ? "Confirmed" : "Unconfirmed"}</Text></div>
                    <Text>FPort</Text>
                    <Input style={{ width: '100%' }} defaultValue={q.port} disabled/>
                  </Col>
                </Row>
              </Card>
            ))
          }
          <div style={{marginRight: 20, marginLeft: 20, marginTop: 15, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
            <RegularButton
              type="primary"
              icon={<ClearOutlined />}
              onClick={() => {onClear()}}
              style={{ borderRadius: 4 }}
            >
              {src === "DeviceShow" ? "Clear Queue for Device" : "Clear Queue for All Label's Devices"}
            </RegularButton>
          </div>
        </div>
      </div>
    )
  }
}

export default Downlink
