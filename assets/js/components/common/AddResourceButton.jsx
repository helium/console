import React from 'react'
import { Popover } from 'antd';
import { NavLink } from 'react-router-dom'
import { PlusCircleFilled } from '@ant-design/icons';

export default ({ deviceCallback, labelCallback, functionCallback, channelCallback }) => {
  return (
    <Popover
      overlayClassName="add-menu-popover"
      content={
        <div style={{ width: 130 }}>
          <NavLink draggable="false" className="add-menu-selection noselect" activeClassName="is-active" onClick={deviceCallback} to={"/devices?show_new=true"}>Add Device</NavLink>
          <NavLink draggable="false" className="add-menu-selection noselect" activeClassName="is-active" onClick={labelCallback} to={"/devices?show_new_label=true"}>Add Label</NavLink>
          <NavLink draggable="false" className="add-menu-selection noselect" activeClassName="is-active" onClick={functionCallback} to={"/functions?show_new=true"}>Add Function</NavLink>
          <NavLink draggable="false" className="add-menu-selection noselect" activeClassName="is-active" onClick={channelCallback} to={"/integrations?show_new=true"}>Add Integration</NavLink>
        </div>
      }
      placement="left"
    >
      <PlusCircleFilled
        style={{
          position: "absolute",
          bottom: 100,
          right: 30,
          fontSize: 40,
          cursor: 'pointer',
          zIndex: 100,
        }}
      />
    </Popover>
  )
}
