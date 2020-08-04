import React, { Fragment, useState } from 'react';
import { Typography, List, Checkbox, Row, Col, Button } from 'antd';
import { grayForModalSelections, strokeForMetaText } from '../../../../util/colors';

const { Text, Title } = Typography;


const ListApplications = (props) => {
  const { applications, importDevices } = props;
  const [ selectedApps, setSelectedApps ] = useState(applications.map(app => app.id));
  const [ createLabels, setCreateLabels ] = useState(true);
  const [ deleteTtnDevices, setDeleteTtnDevices ] = useState(true);
  const horizontalPadding = { paddingLeft: 40, paddingRight: 40 };
  return (
    <Fragment>
      <Title
        style={{ width: '100%', textAlign: 'center', marginTop: 30, fontSize: 30 }}
      >
        {applications.length + " Applications Found"}
      </Title>
      <Text style={{ width: '100%', textAlign: 'center', marginBottom: 40 }}>
        Which applications would you like to import?
      </Text>
      <List
        style={{width: '100%'}}
        dataSource={applications}
        renderItem={
          app => {
            const style = { ...horizontalPadding, display: 'flex', height: 60 };
            const selected = selectedApps.includes(app.id);
            if (selected) {
              Object.assign(style, { background: grayForModalSelections })
            }
            return (
              <List.Item style={style}>
                <Checkbox
                  style={{ marginRight: 20 }}
                  checked={selected}
                  onChange={
                    (e) => {
                      if (e.target.checked) {
                        setSelectedApps(selectedApps.concat([app.id]));
                      } else {
                        const index = selectedApps.indexOf(app.id);
                        setSelectedApps(selectedApps.filter((_, i) => i !== index));
                      }
                    }
                  }/>
                <Text style={{ color: 'black' }}>{app.name}</Text>
                <Text
                  style={{ marginLeft: 'auto', color: strokeForMetaText, fontFamily: 'monospace', fontSize: 14 }}
                >
                  {app.id}
                </Text>
              </List.Item>
            )
          }
        }
      />
      <Row style={{ ...horizontalPadding, marginTop: 10 }}>
        <Col sm={2}><Checkbox checked={createLabels} onChange={() => setCreateLabels(!createLabels)}/></Col>
        <Col sm={22}>
          <Text style={{fontSize: 14, lineHeight: .9}}>
            Import these devices with a premade label of their existing Application ID
          </Text>
        </Col>
      </Row>
      <Row style={{ ...horizontalPadding, marginTop: 10 }}>
        <Col sm={2}>
          <Checkbox checked={deleteTtnDevices} onChange={() => setDeleteTtnDevices(!deleteTtnDevices)}/>
        </Col>
        <Col sm={22}>
          <Text style={{fontSize: 14, lineHeight: .9}}>
            Delete devices in Things Network instance to prevent automatic reassociation
          </Text>
        </Col>
      </Row>
      <Button
        key="submit"
        type="primary"
        style={{ marginTop: 40 }}
        onClick={() => importDevices(selectedApps, createLabels, deleteTtnDevices)}
      >
        Import Devices
      </Button>
    </Fragment>
  )
}

export default ListApplications;