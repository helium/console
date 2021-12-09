import React from 'react'
import MediaQuery from 'react-responsive'

export const MobileDisplay = (props) => {
  if (props.children) {
    return (
      <MediaQuery maxWidth={600}>
        {props.children}
      </MediaQuery>
    )
  } else {
    return (
      <MediaQuery maxWidth={600}>
        This page is not available in mobile mode. Please switch to desktop mode.
      </MediaQuery>
    )
  }
}

export const DesktopDisplay = (props) => {
  return (
    <MediaQuery minWidth={601}>
      {props.children}
    </MediaQuery>
  )
}
