import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../common/DashboardLayout';
import TableHeader from '../common/TableHeader';
import PlusIcon from '../../../img/alerts/alert-index-plus-icon.svg';
import AllIcon from '../../../img/alerts/alert-index-all-icon.svg';
import AlertIcon from '../../../img/alerts/alert-index-add-icon.svg';
import AddResourceButton from '../common/AddResourceButton';
import AlertNew from '../alerts/AlertNew';
import AlertIndexTable from './AlertIndexTable';
import AlertTypeButton from './AlertTypeButton';
import { ALL_ALERTS } from '../../graphql/alerts';
import { useQuery } from '@apollo/client';
import { SkeletonLayout } from '../common/SkeletonLayout';
import DeleteAlertModal from './DeleteAlertModal';

export default (props) => {
  const [showPage, setShowPage] = useState('allAlerts');
  const [alertType, setAlertType] = useState(null);
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { loading, error, data, refetch } = useQuery(ALL_ALERTS);
  const alertsData = data ? data.allAlerts : [];

  // const socket = useSelector(state => state.apollo.socket);
  // const alertsChannel = socket.channel("graphql:alerts_update", {});

  // useEffect(() => {
  //   // executed when mounted
  //   alertsChannel.join();
  //   alertsChannel.on(`graphql:alerts_update:alerts_update`, (_message) => {
  //     refetch();
  //   })

  //   // executed when unmounted
  //   return () => {
  //     alertsChannel.leave();
  //   }
  // }, []);

  const openDeleteAlertModal = (alert) => {
    setShowDeleteAlertModal(true);
    setSelectedAlert(alert);
  }

  const closeDeleteAlertModal = () => {
    setShowDeleteAlertModal(false);
    setSelectedAlert(null);
  }

  return (
    <DashboardLayout
      title="My Alerts"
        user={props.user}
        noAddButton
    >
      <TableHeader
        backgroundColor='#D3E0EE'
        goHome={() => { setShowPage('home') }}
        otherColor='#ACC6DD'
        homeIcon={null}
        goToAll={() => { setShowPage('allAlerts') }}
        allIcon={AllIcon}
        textColor='#3C6B95'
        allText='All Alerts'
        onHomePage={showPage === 'home'}
        onAllPage={showPage === 'allAlerts'}
        onNewPage={showPage === 'new'}
        addIcon={PlusIcon}
        goToNew={() => {
          setShowPage('new');
          setAlertType(null);
        }}
        noHome
        borderRadius='25px'
      >
        {
          showPage === "new" && alertType === null && (
            <div className="blankstateWrapper" style={{ height: '600px', paddingTop: '100px' }}>
            <div style={{width: '100%', maxWidth: '500px', margin: '0 auto', textAlign: 'center'}}>
              <img src={AlertIcon} />
              <h1>Choose Type of Alert</h1>
              <div style={{ padding: '10px 60px 1px 60px', margin: '10px 0px' }}>
                <p style={{ fontSize: '16px', color: '#565656' }}>Alerts can be created for Device/Group Nodes, Function Nodes or Integration Nodes.</p>
              </div>
              <div style={{ flexDirection: 'row', display: 'flex' }}>
                <AlertTypeButton
                  backgroundColor='#2C79EE'
                  onClick={() => { setAlertType('device/group') }}
                >
                  Device/Group Alert
                </AlertTypeButton>
                <AlertTypeButton
                  backgroundColor='#9F59F7'
                  onClick={() => { setAlertType('function') }}
                >
                  Function Alert
                </AlertTypeButton>
                <AlertTypeButton
                  backgroundColor='#12CB9E'
                  onClick={() => { setAlertType('integration') }}
                >
                  Integration Alert
                </AlertTypeButton>
              </div>
            </div>
            <style jsx>{`
                h1 {
                  font-size: 30px;
                  margin: 10px 0px;
                  font-weight: 600;
                }
                p {
                  font-weight: 300;
                  margin-bottom: 10px;
                }
              `}</style>
            </div>
          )
        }
        {
          showPage === 'new' && alertType && (
            <AlertNew alertType={alertType} back={() => { setAlertType(null) }} backToAll={() => { setShowPage: 'allAlerts' }} />
          )
        }
        {
          showPage === 'allAlerts' && error && <Text>Data failed to load, please reload the page and try again</Text>
        }
        {
          showPage === 'allAlerts' && loading && (
            <div style={{ padding: 40 }}><SkeletonLayout /></div>
          )
        }
        {
          showPage === 'allAlerts' && !loading && (
            <AlertIndexTable data={alertsData} openDeleteAlertModal={openDeleteAlertModal} />
          )
        }
      </TableHeader>
      <AddResourceButton />
      <DeleteAlertModal
        open={showDeleteAlertModal}
        alert={selectedAlert}
        close={closeDeleteAlertModal}
      />
    </DashboardLayout>
  )
}