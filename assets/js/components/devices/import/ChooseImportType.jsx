import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { Button, Typography, Popover } from 'antd';
import { blueForDeviceStatsLarge, dragAndDropBackgroundColor } from '../../../util/colors';
import { scanGenericDevices } from '../../../actions/device';
import Warning from '../../../../img/warning.svg';
import ImportIcon from '../../../../img/device-import-icon.svg';
import DragAndDrop from '../../common/DragAndDrop';

const { Text, Title } = Typography

const ChooseImportType = ({onImportSelect, scanGenericDevices, genericImportScanFailed, deviceImports}) => {
  const [open, setOpen] = useState(false);
  if (genericImportScanFailed) return (
    <Fragment>
      <img src={Warning} style={{marginBottom: 10, height: 50, objectFit: 'cover'}}/>
      <Title style={{fontSize: 22, width: '100%', textAlign: 'center'}}>Invalid Filetype</Title>
      <Text style={{width: '100%', textAlign: 'center', margin: '0px 40px 10px'}}>
        <b>Sorry. The file you supplied doesn’t appear to be formatted correctly.</b>
        <br/>
        Please ensure it is a csv file, with correctly formatted headers.
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
        <Text style={{width: '100%', textAlign: 'center', marginBottom: 20, color: 'deepskyblue', textDecoration: 'underline'}}>How do I format my .csv?</Text>
      </Popover>
      <DragAndDrop fileSelected={(file) => {
        let fileReader = new FileReader();
        fileReader.onloadend = () => {
          scanGenericDevices(fileReader.result, (type) => onImportSelect(type));
        }
        fileReader.readAsText(file);
      }}>
        <Text style={{textAlign: 'center', margin: '30px 80px', color: blueForDeviceStatsLarge}}>
          Drag .csv file here or click to choose file
        </Text>
      </DragAndDrop>
    </Fragment>
  )
  return (
    <Fragment>
      <img src={ImportIcon} style={{marginBottom: 10, height: 50, objectFit: 'cover'}}/>
      <Title style={{fontSize: 22}}>Import Devices</Title>
      <Text style={{width: '100%', textAlign: 'center', margin: '0px 40px 10px'}}>
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
        <Text style={{width: '100%', textAlign: 'center', marginBottom: 20, color: 'deepskyblue', textDecoration: 'underline'}}>How do I format my .csv?</Text>
      </Popover>
      {
        (deviceImports && (!deviceImports.entries.length || deviceImports.entries[0].status !== "importing")) ? (
          <Fragment>
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
                scanGenericDevices(fileReader.result, (type) => onImportSelect(type));
              }
              fileReader.readAsText(file);
            }}>
              <Text style={{textAlign: 'center', margin: '30px 80px', color: blueForDeviceStatsLarge}}>
                Drag .csv file here or click to choose file
              </Text>
            </DragAndDrop>
          </Fragment>
        ) : (
          <Text strong>Please wait while your import completes...</Text>
        )
      }
    </Fragment>
  )
}

function mapStateToProps(state) {
  return {
    genericImportScanFailed: state.devices.genericImportScanFailed
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    scanGenericDevices
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseImportType);
