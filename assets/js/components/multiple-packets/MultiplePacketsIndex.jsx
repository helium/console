import React from 'react'
import DashboardLayout from '../common/DashboardLayout'

export default (props) => {
  return (
    <DashboardLayout
      title="Multiple Packets"
        user={props.user}
        noAddButton
    >
      hello!
    </DashboardLayout>
  )
}