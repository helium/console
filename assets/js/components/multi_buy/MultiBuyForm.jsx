import React, { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { Button, Row, Col, Input, Typography, Slider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createMultiBuy } from '../../actions/multiBuy';
import MultiBuyIcon from '../../../img/multi_buy/multi-buy-index-add-icon.svg';
const { Text } = Typography

export default ({ show, setShowPage }) => {
  const [name, setName] = useState('');
  const [multiBuyValue, setMultiBuyValue] = useState(1)
  const dispatch = useDispatch();

  return (
    <div style={{ padding: '30px 30px 20px 30px', display: 'flex', flexDirection: 'column' }}>
      {
        show && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Button size="middle" type="danger" style={{ borderRadius: 5, marginRight: 50 }} onClick={() => {}}>Delete</Button>
          </div>
        )
      }
      <Row style={{ marginTop: '10px' }}>
        <Col span={10} style={{ padding: '70px 80px' }}>
          <img src={MultiBuyIcon} />
          <h1 style={{ marginTop: 10, fontSize: '23px', fontWeight: 600 }}>Multiple Packets</h1>
          <div>
            <p style={{ fontSize: '16px' }}>You can purchase duplicate packets if multiple Hotspots hear the device.</p>
            <p><a>Learn more about Multiple Packets</a></p>
          </div>
        </Col>
        <Col span={12} style={{ padding: '40px 20px'}}>
          <Text style={{ fontSize: '16px' }} strong>Multiple Packet Name</Text>
          <Input
            onChange={e => { setName(e.target.value) }}
            value={name}
            placeholder={'e.g. All Available Packets'}
            suffix={`${name.length}/25`}
            maxLength={25}
          />

          <div style={{ marginTop: 40, width: '80%' }}>
            <Text style={{ display: 'block', fontSize: 14, fontWeight: 400 }}>How many packets do you want to purchase if available?</Text>
            <div style={{ width: '100%', marginBottom: 12, marginTop: 20 }}>
              <Slider
                value={multiBuyValue}
                min={1}
                max={10}
                tooltipVisible={false}
                onChange={value => setMultiBuyValue(value)}
              />
            </div>

            <p style={{ color: '#096DD9', fontSize: 18, fontWeight: 600 }}>
              {
                (!multiBuyValue || multiBuyValue == 1) && "Just 1 Packet"
              }
              {
                multiBuyValue > 1 && multiBuyValue < 10 && `Up to ${multiBuyValue} Packets`
              }
              {
                multiBuyValue == 10 && `All Available Packets`
              }
            </p>
          </div>

          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{ borderColor: '#2C79EE', backgroundColor: '#2C79EE', borderRadius: 50, text: 'white', marginTop: 40 }}
            onClick={() => {
              dispatch(createMultiBuy({ name, value: multiBuyValue }))
              .then(() => { setShowPage("allMultiBuy") })
            }}
          >
            Create Multiple Packet Config
          </Button>
        </Col>
      </Row>
    </div>
  )
}
