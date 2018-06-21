import React, { Component } from 'react'
import QRCode from 'qrcode.react';
import { graphql } from 'react-apollo';
import Typography from '@material-ui/core/Typography';
import { GATEWAY_QR_DATA_QUERY } from '../../graphql/gateways'

const queryOptions = {
  options: props => ({
    variables: {
      id: props.gateway.id
    }
  })
}

@graphql(GATEWAY_QR_DATA_QUERY, queryOptions)
class GatewayQRCode extends Component {
  render() {
    if (this.props.data.loading) {
      return <Typography variant="headline" style={{fontWeight: '500'}}>
        Loading QR Code...
      </Typography>
    }

    const data = JSON.stringify(this.props.data.gatewayQrData)
    return <QRCode value={data} size={256}/>
  }
}

export default GatewayQRCode
