import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TTNLoading from '../../../../img/ttn-waiting-cloud.svg';
import ListApplications from './ttn/ListApplications';
import { fetchTtnDevices, importTtnDevices, importGenericDevices, resetGenericDeviceImport } from '../../../actions/device';
import ShowDeviceData from './generic/ShowDeviceData';
import GetApplications from './ttn/GetApplications';
import { Modal, Spin, Typography } from 'antd';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import analyticsLogger from '../../../util/analyticsLogger';
const { Text, Title } = Typography

const antLoader = <LoadingOutlined style={{ fontSize: 50, color: 'white' }} spin />;
const antLoaderGrey = <LoadingOutlined style={{ fontSize: 50, color: 'grey' }} spin />

const ImportDevicesModal = (props) => {
  const {
    open,
    onClose,
    fetchTtnDevices,
    importTtnDevices,
    ttnAuthorizationCode,
    importGenericDevices,
    resetGenericDeviceImport,
    importComplete,
    importType
  } = props;
  const {
    fetchingTtnApplications,
    fetchedTtnApplications,
    ttnApplications,
    importStarted,
    importStarting,
    genericImportScanned,
    scannedGenericDevices,
    import_status,
  } = props;

  const handleImport = (withLabel) => {
    analyticsLogger.logEvent("ACTION_GENERIC_IMPORT", { withLabel });
    importGenericDevices(scannedGenericDevices, withLabel);
  }

  return (
    <Modal
      visible={open}
      centered
      onCancel={() => {
        onClose();
        setTimeout(() => {
          resetGenericDeviceImport();
        }, 500)
      }}
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
                (applications, createLabels, deleteDevices, deleteApps) => {
                  analyticsLogger.logEvent("ACTION_TTN_IMPORT", {applications, deleteDevices, createLabels, deleteApps});
                  importTtnDevices(applications, ttnAuthorizationCode, createLabels, deleteDevices, deleteApps)
                }
              }/>
          ))
        ) ||
        (
          importType === 'csv' && (
            (genericImportScanned &&
            <ShowDeviceData numDevices={scannedGenericDevices.length} onImport={handleImport}/>) ||
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
              <Title style={{width: '100%', textAlign: 'center'}}>Import Status</Title>
              {importStarted && !importComplete && <Spin indicator={antLoaderGrey} style={{ marginBottom: 20 }}/>}
              {importStarted && !importComplete && <Text style={{ textAlign: 'center' }}>Please wait while your import is being completed.</Text>}
              {importComplete && (
                <div>
                  {
                    import_status.successful_count && (
                      <Text style={{ display: 'block', marginBottom: 12, textAlign: 'center' }}>
                        Successfully imported {import_status.successful_count} device{(import_status.successful_count !== 1 && "s") || ""}, please return to the device index page to view your new devices.
                      </Text>
                    )
                  }
                  {
                    import_status.failed_devices.length > 0 && (
                      <Text style={{ display: 'block', marginBottom: 12, textAlign: 'center' }}>
                        Errors Encountered:
                      </Text>
                    )
                  }
                  {
                    import_status.failed_devices.length == 0 && (
                      <Text style={{ display: 'block', marginBottom: 12, textAlign: 'center' }}>
                        An unexpected error has occurred, please try again later or contact support.
                      </Text>
                    )
                  }
                  {
                    import_status.failed_devices.map(msg => (
                      <Text key={msg} style={{ display: 'block', fontSize: 10 }}>{msg}</Text>
                    ))
                  }
                </div>
              )}
            </div>
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
