import React, { Component } from 'react'

// MUI
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const HttpDetails = (props) => {
  const { channel } = props
  const { endpoint } = channel

  if (endpoint === undefined) return <div />

  return (
    <Card style={{marginTop: 24}}>
      <CardContent>
        <Typography variant="headline" component="h3">
          HTTP Details
        </Typography>
        <Typography component="p">
          Method: {channel.method}
        </Typography>
        <Typography component="p">
          Endpoint: {channel.endpoint}
        </Typography>
        {
          false && (
            <Typography component="div">
              {"Inbound: "}
              <TextField
                value={`https://router.helium.com/http/${channel.inbound_token}`}
                readOnly
                style={{width: 400}}
              />
            </Typography>
          )
        }
      </CardContent>
    </Card>
  )
}

export default HttpDetails
