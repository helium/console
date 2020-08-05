import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import { ALL_LABELS } from '../../../graphql/labels';
import TTNLoading from '../../../../img/ttn-waiting-cloud.svg';
import ListApplications from './ttn/ListApplications';
import { fetchTtnDevices, importTtnDevices, importGenericDevices, resetGenericDeviceImport } from '../../../actions/device';
import ChooseImportType from './ChooseImportType';
import ShowDeviceData from './generic/ShowDeviceData';
import GetApplications from './ttn/GetApplications';
import { Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antLoader = <LoadingOutlined style={{ fontSize: 50, color: 'white' }} spin />;
const antLoaderGrey = <LoadingOutlined style={{ fontSize: 50, color: 'grey' }} spin />


const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

//@connect(null, mapDispatchToProps)
//@graphql(ALL_LABELS, queryOptions)
const ImportDevicesModal = (props) => {
  const {
    open,
    onClose,
    fetchTtnDevices,
    importTtnDevices,
    ttnAuthorizationCode,
    importGenericDevices,
    resetGenericDeviceImport
  } = props;
  const [ importType, setImportType ] = useState('');
  const {
    fetchingTtnApplications,
    fetchedTtnApplications,
    ttnApplications,
    importStarted,
    importStarting,
    genericImportScanned,
    scannedGenericDevices
  } = props;

  const handleImport = (withLabel) => {
    importGenericDevices(scannedGenericDevices, withLabel);
  }

  useEffect(() => {
    if (importStarted) {
      onClose();
      setTimeout(() => {
        resetGenericDeviceImport();
        setImportType('');
      }, 500);
    }
  }, [importStarted]);

  return (
    <Modal
      visible={open}
      centered
      onCancel={() => {onClose(); setTimeout(() => {
        resetGenericDeviceImport();
        setImportType('');
      }, 500)}}
      footer={null}
      header={null}
      width={450}
      bodyStyle={{
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 0,
        paddingRight: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}
    >
      {
        (
          !importType &&
          <ChooseImportType onImportSelect={(type) => setImportType(type)}/>
        ) ||
        ( 
          importType === 'ttn' && (
          (
            !fetchingTtnApplications && !fetchedTtnApplications && 
            (
              <GetApplications fetchTtnDevices={fetchTtnDevices}/>
            )
          ) || 
          (
            (!fetchedTtnApplications || importStarting) &&
            (
              <div style={{
                marginTop: 40,
                marginBottom: 40,
                paddingTop: 55,
                width: 220,
                height: 135,
                backgroundImage: `url(${TTNLoading})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100%',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <Spin indicator={antLoader}/>
              </div>
            )
          ) ||
          (
            <ListApplications
              applications={ttnApplications}
              importDevices={
                (applications, createLabels, deleteDevices) => {
                  importTtnDevices(applications, ttnAuthorizationCode, createLabels, deleteDevices)
                }
              }/>
          ))
        ) || 
        (
          importType === 'csv' && (
            (genericImportScanned &&
            <ShowDeviceData numDevices={scannedGenericDevices.length} onImport={handleImport}/>) ||
            <Spin indicator={antLoaderGrey}/>
          )
        )
      }
    </Modal>
  )
}

function mapStateToProps(state) {
  return {
    fetchedTtnApplications: state.devices.fetchedTtnApplications,
    fetchingTtnApplications: state.devices.fetchingTtnApplications,
    ttnApplications: state.devices.ttnApplications,
    ttnAuthorizationCode: state.devices.ttnAuthorizationCode,
    importStarting: state.devices.importStarting,
    importStarted: state.devices.importStarted,
    genericImportScanned: state.devices.genericImportScanned,
    scannedGenericDevices: state.devices.scannedGenericDevices,
    scannedFileName: state.devices.scannedFileName
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchTtnDevices, importTtnDevices, importGenericDevices, resetGenericDeviceImport}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportDevicesModal);
