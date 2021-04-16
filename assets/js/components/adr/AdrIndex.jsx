import React from 'react'
import DashboardLayout from '../common/DashboardLayout'

export default (props) => {
  return (
    <DashboardLayout
      title="Adaptive Data Rates"
        user={props.user}
        noAddButton
    >
      hello!
    </DashboardLayout>
  )
}