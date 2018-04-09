import React from 'react';

const ChannelNameForm = (props) => (
  <div>
    <h3>Step 3</h3>
    <p>Name your Channel</p>
    <form onSubmit={props.onSubmit}>
      <label>Channel Name</label>
      <input type="text" name="channelName" value={props.channelName} onChange={props.onInputUpdate}/>
      <div><button type="submit">Create Channel</button></div>
    </form>
  </div>
)

export default ChannelNameForm;
