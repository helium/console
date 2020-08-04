import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { Button, Typography, Popover } from 'antd';
import { blueForDeviceStatsLarge, dragAndDropBackgroundColor } from '../../../util/colors';
import { scanGenericDevices } from '../../../actions/device';
import DragAndDrop from '../../common/DragAndDrop';

const { Text, Title } = Typography

const ChooseImportType = ({onImportSelect, scanGenericDevices}) => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <Title style={{fontSize: 40}}>Import Devices</Title>
      <Text style={{width: '100%', textAlign: 'center', margin: '0px 40px 20px'}}>
        You can import your devices directly from the Things Network, or in bulk via .csv upload.
      </Text>
      <Popover
        onVisibleChange={() => setOpen(!open)}
        visible={open}
        trigger="click"
        content={
          <Text style={{display: 'table', whiteSpace: 'normal', width: 200}}>
            The fields <b>DevEUI, AppEUI, AppKey,</b> and <b>Name</b> are all required. Optionally you can include a <b>LabelID</b> column to add labels to imported devices.
          </Text>
        }
      >
        <Text style={{width: '100%', textAlign: 'center', marginBottom: 40, color: 'deepskyblue', textDecoration: 'underline'}}>How do I format my .csv?</Text>
      </Popover>
      
      <Button
        type="primary"
        onClick={() => onImportSelect('ttn')}
        style={{ width: '100%', marginLeft: 60, marginRight: 60 }}
      >
        Import from The Things Network
      </Button>
      <DragAndDrop fileSelected={(file) => {
        let fileReader = new FileReader();
        fileReader.onloadend = () => {
          scanGenericDevices(fileReader.result, file.name);
        }
        fileReader.readAsText(file);
        onImportSelect('csv');
      }}>
        <Text style={{textAlign: 'center', margin: '30px 80px', color: blueForDeviceStatsLarge}}>
          Drag .csv file here or click to choose file
        </Text>
      </DragAndDrop>
    </Fragment>
  )
}

function mapStateToProps(state, ownProps) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    scanGenericDevices
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseImportType);