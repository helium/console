import React from 'react'
import MediaQuery from 'react-responsive'
import { Typography } from 'antd';
const { Text } = Typography

export const MobileDisplay = (props) => {
  if (props.children) {
    return (
      <MediaQuery maxWidth={719}>
        {props.children}
      </MediaQuery>
    )
  } else {
    return (
      <MediaQuery maxWidth={719}>
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, textAlign: 'center' }}>
          <Text strong style={{ fontSize: 18 }}>This page is currently unavailable in Mobile View. Please switch to Desktop View to access this page.</Text>
        </div>
      </MediaQuery>
    )
  }
}

export const DesktopDisplay = (props) => {
  return (
    <MediaQuery minWidth={720}>
      {props.children}
    </MediaQuery>
  )
}
