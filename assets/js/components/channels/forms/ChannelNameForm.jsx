import React from 'react';

const ChannelNameForm = (props) => (
  <div>
    <h3>Step 3</h3>
    <p>Name your Channel</p>
    <div>
      <label>Channel Name</label>
      <input type="text" name="channelName" value={props.channelName} onChange={props.onInputUpdate}/>
    </div>
  </div>
)

export default ChannelNameForm;
