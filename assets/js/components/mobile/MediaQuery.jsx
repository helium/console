import React from 'react'
import { useSelector, useDispatch } from "react-redux";
import MediaQuery from 'react-responsive'
import MobileLayout from './MobileLayout'
import { Typography } from 'antd';
const { Text } = Typography
import { updateDisplay } from '../../actions/display'

export const MobileDisplay = (props) => {
  const dispatch = useDispatch();
  const desktopOnly = useSelector((state) => state.display.desktopOnly);
  if (!desktopOnly && props.children) {
    return (
      <MediaQuery maxWidth={720}>
        {props.children}
      </MediaQuery>
    )
  } else if (!desktopOnly) {
    return (
      <MediaQuery maxWidth={720}>
        <MobileLayout>
          <div style={{ backgroundColor: "#F5F7F9", height: '100%', width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, textAlign: 'center' }}>
            <Text strong style={{ fontSize: 18 }}>
              This page is currently unavailable in Mobile View. To access this page, please click to <Text style={{ color: '#2C79EE', fontWeight: 600, cursor: 'pointer' }} onClick={() => dispatch(updateDisplay(true))}>Switch to Desktop View</Text>.
            </Text>
          </div>
        </MobileLayout>
      </MediaQuery>
    )
  } else {
    return <React.Fragment />
  }
}

export const DesktopDisplay = (props) => {
  const desktopOnly = useSelector((state) => state.display.desktopOnly);
  if (desktopOnly) {
    return (
      <React.Fragment>{props.children}</React.Fragment>
    )
  } else {
    return (
      <MediaQuery minWidth={720}>
        {props.children}
      </MediaQuery>
    )
  }
}
