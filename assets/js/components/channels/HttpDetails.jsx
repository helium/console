import React, { Component } from 'react'

// MUI
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const HttpDetails = (props) => {
  const { channel } = props
  const { credentials } = channel

  if (credentials === undefined) return <div />

  return (
    <Card style={{marginTop: 24}}>
      <CardContent>
        <Typography variant="headline" component="h3">
          HTTP Details
        </Typography>
        <Typography component="p">
          Method: {credentials.method}
        </Typography>
        <Typography component="p">
          endpoint: {credentials.endpoint}
        </Typography>
        <Typography component="div">
          Inbound:
          <TextField
            value={`https://router.helium.com/http/${credentials.inbound_token}`}
            readOnly
            style={{width: 400}}
          />
        </Typography>
      </CardContent>
    </Card>
  )
}

export default HttpDetails
