import React from 'react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const ChannelNameForm = (props) => (
  <div>
    <Card style={{marginTop: 24}}>
      <CardContent>
        <Typography variant="headline">
          Step 3
        </Typography>

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          Name your Channel
        </Typography>

        <div style={{width: '50%'}}>
          <form onSubmit={props.onSubmit}>
            <TextField
              type="text"
              label="Channel Name"
              name="channelName"
              value={props.channelName}
              onChange={props.onInputUpdate}
              fullWidth
            />

            <Button
              type="submit"
              variant="raised"
              color="primary"
              size="large"
              style={{marginTop: 24}}
            >
              Create Channel
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
)

export default ChannelNameForm;
