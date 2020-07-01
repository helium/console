import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import { ALL_LABELS } from '../../../graphql/labels';
import TTNLoading from '../../../../img/ttn-waiting-cloud.svg';
import ListApplications from './ListApplications';
import { fetchTtnDevices, importTtnDevices } from '../../../actions/device';
import GetApplications from './GetApplications';
import { Modal, Typography, Select, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text, Title } = Typography
const { Option } = Select
const antLoader = <LoadingOutlined style={{ fontSize: 50, color: 'white' }} spin />;


const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

//@connect(null, mapDispatchToProps)
//@graphql(ALL_LABELS, queryOptions)
const ImportDevicesModal = (props) => {
  const { open, onClose, fetchTtnDevices, importTtnDevices, ttnAuthorizationCode } = props;
  const {
    fetchingTtnApplications,
    fetchedTtnApplications,
    ttnApplications,
    importStarted,
    importStarting
  } = props;

  useEffect(() => {
    if (importStarted) {
      onClose();
    }
  }, [importStarted]);

  return (
    <Modal
      visible={open}
      centered
      onCancel={onClose}
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
    importStarted: state.devices.importStarted
  }

}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchTtnDevices, importTtnDevices}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportDevicesModal);
