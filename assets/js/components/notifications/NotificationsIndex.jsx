import React from 'react'
import DashboardLayout from '../common/DashboardLayout'

export default (props) => {
  return (
    <DashboardLayout
      title="My Notifications"
        user={props.user}
        noAddButton
    >
      hello!
    </DashboardLayout>
  )
}