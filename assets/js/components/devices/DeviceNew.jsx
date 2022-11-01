import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ALL_IMPORTS, DEVICE_COUNT } from '../../graphql/devices'
import { ALL_LABELS } from '../../graphql/labels'
import ChooseImportType from './import/ChooseImportType'
import { createDevice } from '../../actions/device'
import { MobileDisplay, DesktopDisplay } from '../mobile/MediaQuery'
import MobileLayout from '../mobile/MobileLayout'
import { displayInfo, displayError } from '../../util/messages'
import UserCan from '../common/UserCan'
import DeviceDashboardLayout from './DeviceDashboardLayout'
import ImportDevicesModal from './import/ImportDevicesModal'
import ScanDeviceModal from './ScanDeviceModal'
import analyticsLogger from '../../util/analyticsLogger'
import { minWidth } from '../../util/constants'
import { Card, Button, Typography, Input, Row, Col } from 'antd'
import EyeOutlined from '@ant-design/icons/EyeOutlined'
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined'
import SaveOutlined from '@ant-design/icons/SaveOutlined'
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined'
import LabelAppliedNew from '../common/LabelAppliedNew'
const { Text } = Typography
import find from 'lodash/find'
import ProfileDropdown from '../common/ProfileDropdown'
import { isMobile } from '../../util/constants'
import DeviceCapMetMessage from './DeviceCapMetMessage'

export default (props) => {
  const USING_CAP = process.env.IMPOSE_HARD_CAP === 'true'
  const history = useHistory()
  const dispatch = useDispatch()
  const nameInputRef = React.createRef()

  const PAGE = 1
  const PAGE_SIZE = 10

  const currentOrganizationAppEui = useSelector(
    (state) => state.organization.currentOrganizationAppEui
  )

  const [name, setName] = useState('')
  const [devEUI, setDevEUI] = useState(
    process.env.SELF_HOSTED ? randomString(16) : '6081F9' + randomString(10)
  )
  const [appEUI, setAppEUI] = useState(
    process.env.SELF_HOSTED ? randomString(16) : currentOrganizationAppEui
  )
  const [appKey, setAppKey] = useState(randomString(32))
  const [labelName, setLabelName] = useState(null)
  const [showAppKey, setShowAppKey] = useState(true)
  const [showImportDevicesModal, setShowImportDevicesModal] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [importType, setImportType] = useState('')
  const [importStatus, setImportStatus] = useState({ failed_devices: [] }) //import_status
  const [configProfileId, setConfigProfileId] = useState(null)
  const [showScanDeviceModal, setShowScanDeviceModal] = useState(false)

  const { data: importsQueryData, refetch: importsQueryRefetch } = useQuery(
    ALL_IMPORTS,
    {
      variables: { page: PAGE, pageSize: PAGE_SIZE },
    }
  )

  const deviceImports = importsQueryData?.device_imports || []

  const { data: allLabelsData } = useQuery(ALL_LABELS, {
    variables: {},
  })
  const allLabels = allLabelsData?.allLabels || []

  const { data: deviceCountData } = useQuery(DEVICE_COUNT)
  const deviceCount = deviceCountData?.device_count?.count || 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (devEUI.length === 16 && appEUI.length === 16 && appKey.length === 32) {
      analyticsLogger.logEvent(
        isMobile ? 'ACTION_CREATE_DEVICE_MOBILE' : 'ACTION_CREATE_DEVICE',
        {
          name: name,
          devEUI: devEUI,
          appEUI: appEUI,
          appKey: appKey,
          configProfileId: configProfileId,
        }
      )
      let foundLabel = find(allLabels, {
        name: labelName,
      })
      let label = foundLabel
        ? { labelApplied: foundLabel.id }
        : { newLabel: labelName }
      dispatch(
        createDevice(
          {
            name,
            dev_eui: devEUI.toUpperCase(),
            app_eui: appEUI.toUpperCase(),
            app_key: appKey.toUpperCase(),
            config_profile_id: configProfileId,
          },
          label
        )
      ).then(() => {
        if (USING_CAP && deviceCount === 9) {
          displayInfo(
            'The device cap has been met. To add devices for commercial use cases, reach out to sales@nova-labs.com.'
          )
        }
        history.push('/devices')
      })
    } else {
      displayError(
        `Please ensure your device credentials are of the correct length.`
      )
    }
  }

  const closeImportDevicesModal = () => {
    setShowImportDevicesModal(false)
    setImportComplete(false)
    setImportStatus({ failed_devices: [] })
  }

  const closeScanDeviceModal = () => {
    setShowScanDeviceModal(false)
  }

  const updateEuiPair = (devEUI, appEUI) => {
    setDevEUI(devEUI)
    setAppEUI(appEUI)
    setAppKey('')
  }

  const renderHelpText = (mobile) => (
    <p style={{ fontSize: 16 }}>
      <b>Important:</b> {USING_CAP && 'Users can add up to 10 devices.'} The
      first time a device joins the Network could take up to 20 mins.{' '}
      <a
        className='help-link'
        href='https://docs.helium.com/use-the-network/console/adding-devices/#important-information-when-adding-devices'
        target='_blank'
        style={{ display: mobile ? 'block' : 'inline' }}
      >
        Learn more about adding devices
      </a>
    </p>
  )

  const renderDeviceDetails = () => {
    return (
      <React.Fragment>
        <Input
          placeholder='Device Name'
          name='name'
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          addonBefore='Name'
          ref={nameInputRef}
          autoFocus
          suffix={`${name.length}/52`}
          maxLength={52}
        />

        <Input
          placeholder='Device EUI'
          name='devEUI'
          value={devEUI}
          onChange={(e) => {
            setDevEUI(e.target.value)
          }}
          style={{ marginTop: 10 }}
          maxLength={16}
          addonBefore='Dev EUI'
          suffix={
            <Text type={devEUI.length !== 16 ? 'danger' : ''}>
              {Math.floor(devEUI.length / 2)} / 8 Bytes
            </Text>
          }
        />

        <Input
          placeholder='App EUI'
          name='appEUI'
          value={appEUI}
          onChange={(e) => {
            setAppEUI(e.target.value)
          }}
          style={{ marginTop: 10 }}
          maxLength={16}
          addonBefore='App EUI'
          suffix={
            <Text type={appEUI.length !== 16 ? 'danger' : ''}>
              {Math.floor(appEUI.length / 2)} / 8 Bytes
            </Text>
          }
        />

        <Input
          placeholder='App Key'
          name='appKey'
          value={showAppKey ? appKey : '✱'.repeat(28)}
          disabled={!showAppKey}
          onChange={(e) => {
            setAppKey(e.target.value)
          }}
          style={{ marginTop: 10 }}
          maxLength={56}
          addonBefore={
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              App Key
              {showAppKey ? (
                <EyeOutlined
                  onClick={() => {
                    setShowAppKey(!showAppKey)
                  }}
                  style={{ marginLeft: 5 }}
                />
              ) : (
                <EyeInvisibleOutlined
                  onClick={() => setShowAppKey(!showAppKey)}
                  style={{ marginLeft: 5 }}
                />
              )}
            </div>
          }
          suffix={
            <Text type={appKey.length !== 32 ? 'danger' : ''}>
              {Math.floor(appKey.length / 2)} / 16 Bytes
            </Text>
          }
        />
        <Text style={{ marginTop: 25, display: 'block' }} strong>
          Profile (Optional)
        </Text>
        <ProfileDropdown
          selectProfile={(id) => {
            setConfigProfileId(id)
          }}
        />

        <Text style={{ marginTop: 25, display: 'block' }} strong>
          Attach a Label (Optional)
        </Text>
        <LabelAppliedNew
          allLabels={allLabels}
          value={labelName}
          select={(value) => setLabelName(value)}
        />
      </React.Fragment>
    )
  }

  const socket = useSelector((state) => state.apollo.socket)
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  )
  const importChannel = socket.channel('graphql:device_import_update', {})

  useEffect(() => {
    // executed when mounted
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }

    importChannel.join()
    importChannel.on(
      `graphql:device_import_update:${currentOrganizationId}:import_list_updated`,
      (message) => {
        importsQueryRefetch({ page: PAGE, pageSize: PAGE_SIZE })
        const user_id = props.user.sub.startsWith('auth0')
          ? props.user.sub.slice(6)
          : props.user.sub

        setImportComplete(true)

        if (user_id === message.user_id && message.status === 'success') {
          displayInfo(
            `Imported ${message.successful_devices} device${
              (message.successful_devices !== 1 && 's') || ''
            } from ${
              message.type === 'ttn' ? 'The Things Network' : 'CSV'
            }. Refresh this page to see the changes.`
          )
          setImportStatus({
            failed_devices: message.failed_devices,
            successful_count: message.successful_devices,
          })
        }
        if (user_id === message.user_id && message.status === 'failed') {
          displayError(
            `Failed to import devices from ${
              message.type === 'ttn' ? 'The Things Network' : 'CSV'
            }.`
          )
          setImportStatus({
            failed_devices: message.failed_devices || [],
          })
        }
      }
    )

    // executed when unmounted
    return () => {
      importChannel.leave()
    }
  }, [])

  return (
    <>
      <MobileDisplay>
        <MobileLayout>
          <div
            style={{
              padding: '10px 15px',
              boxShadow: '0px 3px 7px 0px #ccc',
              backgroundColor: '#F5F7F9',
              height: 100,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Button
              icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
              style={{
                border: 'none',
                padding: 0,
                fontSize: 14,
                color: '#2C79EE',
                height: 24,
                boxShadow: 'none',
                background: 'none',
                fontWeight: 600,
              }}
              onClick={() => {
                history.push('/devices')
              }}
            >
              Back to Devices
            </Button>
            <div>
              {!(USING_CAP && deviceCount >= 10) && (
                <>
                  <Text style={{ fontSize: 27, fontWeight: 600 }}>
                    Create New Device
                  </Text>
                </>
              )}
            </div>
          </div>
          <div
            style={{
              padding: '25px 15px',
              backgroundColor: '#ffffff',
              height: 'calc(100% - 100px)',
              overflowY: 'scroll',
            }}
          >
            {USING_CAP && deviceCount >= 10 ? (
              <DeviceCapMetMessage mobile />
            ) : (
              <>
                {renderHelpText(true)}
                {USING_CAP && (
                  <div style={{ paddingBottom: '10px', textAlign: 'end' }}>
                    <Text style={{ fontSize: 16, fontWeight: 600 }}>
                      {USING_CAP && `${10 - deviceCount} of 10 Devices Left`}
                    </Text>
                  </div>
                )}
                <Button
                  key='submit'
                  onClick={() => {
                    setShowScanDeviceModal(true)
                  }}
                  style={{ marginBottom: 20 }}
                >
                  Scan Device QR Code
                </Button>
                {renderDeviceDetails()}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                >
                  <UserCan>
                    <Button
                      key='submit'
                      type='primary'
                      icon={<SaveOutlined />}
                      onClick={handleSubmit}
                      style={{ marginTop: 15, borderRadius: 4 }}
                    >
                      Save Device
                    </Button>
                  </UserCan>
                </div>
              </>
            )}
          </div>
          <ScanDeviceModal
            open={showScanDeviceModal}
            onClose={closeScanDeviceModal}
            updateEuiPair={updateEuiPair}
          />
        </MobileLayout>
      </MobileDisplay>
      <DesktopDisplay>
        <DeviceDashboardLayout {...props}>
          <div className='no-scroll-bar' style={{ overflowX: 'scroll' }}>
            {USING_CAP && deviceCount >= 10 ? (
              <DeviceCapMetMessage />
            ) : (
              <div style={{ padding: '30px 30px 20px 30px', minWidth }}>
                <Text style={{ fontSize: 22, fontWeight: 600 }}>
                  Add New Device
                </Text>
                <div>{renderHelpText()}</div>
                <Row gutter={30} style={{ marginTop: 10 }}>
                  <Col span={14}>
                    <Card
                      title='Enter Device Details'
                      extra={
                        USING_CAP && `${10 - deviceCount} of 10 Devices Left`
                      }
                    >
                      {renderDeviceDetails()}
                    </Card>
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <UserCan>
                        <Button
                          key='submit'
                          icon={<SaveOutlined />}
                          onClick={handleSubmit}
                          style={{ margin: 0 }}
                        >
                          Save Device
                        </Button>
                      </UserCan>
                    </div>
                  </Col>
                  <Col span={10}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <ChooseImportType
                        onImportSelect={(importType) => {
                          setImportType(importType)
                          setShowImportDevicesModal(true)
                        }}
                        deviceImports={deviceImports}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>

          <ImportDevicesModal
            open={showImportDevicesModal}
            onClose={closeImportDevicesModal}
            importComplete={importComplete}
            importType={importType}
            import_status={importStatus}
          />
        </DeviceDashboardLayout>
      </DesktopDisplay>
    </>
  )
}

const randomString = (length) => {
  let chars = '0123456789ABCDEF'
  let result = ''
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}
