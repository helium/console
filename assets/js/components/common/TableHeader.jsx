import React from 'react';
import NavPointTriangle from './NavPointTriangle';
import { Typography } from 'antd';
const { Text } = Typography

export default (props) => {
  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: 6, overflow: 'hidden', boxShadow: '0px 20px 20px -7px rgba(17, 24, 31, 0.19)' }}>
      <div style={{ padding: 20, backgroundColor: props.backgroundColor, display: 'flex', flexDirection: 'row', overflowX: 'scroll' }}>
        {!props.noHome &&
          <div
            style={{
              backgroundColor: props.otherColor,
              borderRadius: 6,
              padding: 10,
              cursor: 'pointer',
              height: 50,
              width: 50,
              minWidth: 50,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
              position: 'relative'
            }}
            onClick={props.goHome}
          >
            <img src={props.homeIcon} style={{ height: 20, paddingLeft: 2 }} />
            {props.onHomePage && <NavPointTriangle />}
          </div>
        }
        <div
          style={{
            backgroundColor: props.otherColor,
            borderRadius: props.borderRadius ? props.borderRadius : 6,
            padding: '5px 10px 5px 10px',
            cursor: 'pointer',
            height: 50,
            width: props.allButtonStyles ? props.allButtonStyles.width : 110,
            minWidth: props.allButtonStyles ? props.allButtonStyles.minWidth : 110,
            display: 'flex',
            flexDirection: 'column',
            marginRight: 12,
            position: 'relative'
          }}
          onClick={props.goToAll}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
            <img src={props.allIcon} style={{ height: 12, marginRight: 4 }} />
            <Text style={{ color: props.textColor, fontWeight: 500, whiteSpace: 'nowrap' }}>{props.allText}</Text>
          </div>
          <Text style={{ color: props.textColor, fontSize: 10, whiteSpace: 'nowrap' }}>{props.allSubtext}</Text>
          {props.onAllPage && <NavPointTriangle />}
        </div>
        <div style={{
          backgroundColor: props.otherColor,
          borderRadius: props.borderRadius ? props.borderRadius : 6,
          padding: 10,
          cursor: 'pointer',
          height: 50,
          width: 50,
          minWidth: 50,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          whiteSpace: 'nowrap',
          position: 'relative'
        }} onClick={props.goToNew}>
          <img src={props.addIcon} style={{ height: 20 }} />
          {props.onNewPage && <NavPointTriangle />}
        </div>
        {props.extraContent}
      </div>
      {props.children}
    </div>
  );
}
