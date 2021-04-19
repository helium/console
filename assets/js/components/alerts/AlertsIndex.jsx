import React, { useState } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import TableHeader from '../common/TableHeader'
import PlusIcon from '../../../img/alerts/alert-index-plus-icon.svg'
import AllIcon from '../../../img/alerts/alert-index-all-icon.svg'
import AlertIcon from '../../../img/alerts/alert-index-add-icon.svg'
import AddResourceButton from '../common/AddResourceButton'
import AlertNew from '../alerts/AlertNew';

export default (props) => {
  const [showPage, setShowPage] = useState('allAlerts');
  const [alertType, setAlertType] = useState(null);
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
            <div className="blankstateWrapper">
            <div className="message">
              <img src={AlertIcon} />
              <h1>Choose Type of Alert</h1>
              <div className="explainer">
                <p>Alerts can be created for Device/Group Nodes, Function Nodes or Integration Nodes.</p>
              </div>
              <div style={{ flexDirection: 'row', display: 'flex' }}>
                <div 
                  style={{
                    backgroundColor: '#2C79EE',
                    borderRadius: '30px',
                    padding: '5px 10px 5px 10px',
                    cursor: 'pointer',
                    height: 50,
                    width: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    marginRight: 12,
                    position: 'relative',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 500
                  }}
                  onClick={() => { setAlertType('device/group') }}
                >
                  Device/Group Alert
                </div>
                <div 
                  style={{
                    backgroundColor: '#9F59F7',
                    borderRadius: '30px',
                    padding: '5px 10px 5px 10px',
                    cursor: 'pointer',
                    height: 50,
                    width: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    marginRight: 12,
                    position: 'relative',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 500
                  }}
                  onClick={() => { setAlertType('function') }}
                >
                  Function Alert
                </div>
                <div 
                  style={{
                    backgroundColor: '#12CB9E',
                    borderRadius: '30px',
                    padding: '5px 10px 5px 10px',
                    cursor: 'pointer',
                    height: 50,
                    width: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    marginRight: 12,
                    position: 'relative',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 500
                  }}
                  onClick={() => { setAlertType('integration') }}
                >
                  Integration Alert
                </div>
              </div>
            </div>
            <style jsx>{`
                .message {
                  width: 100%;
                  max-width: 500px;
                  margin: 0 auto;
                  text-align: center;
                }
                .explainer {
                  padding: 10px 60px 1px 60px;
                  border-radius: 20px;
                  text-align: center;
                  margin: 10px 0px;
                  box-sizing: border-box;
                  border: none;
                }
                .explainer p {
                  color: #565656;
                  font-size: 15px;
                }
                .explainer p a {
                  color: #096DD9;
                }
                h1, p  {
                  color: #242425;
                }
                h1 {
                  font-size: 30px;
                  margin: 10px 0px;
                  font-weight: 600;
                }
                p {
                  font-size: 20px;
                  font-weight: 300;
                  margin-bottom: 10px;
                }
              `}</style>
            </div>
          )
        }
        {
          showPage === 'new' && alertType && (
            <AlertNew alertType={alertType} back={() => { setAlertType(null) }} />
          )
        }
      </TableHeader>
      <AddResourceButton />
    </DashboardLayout>
  )
}