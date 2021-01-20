import React from 'react'

const StripeCardElement = ({ id }) => (
  <div style={{ marginTop: 24 }}>
    <div id={id} />
    <div id="card-errors" role="alert" />
  </div>
)

export default StripeCardElement
