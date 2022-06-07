import React from 'react';
import NavPointTriangle from '../common/NavPointTriangle';
import BarIcon from '../../../img/functions/function-bar-icon.svg'
import Warning from "../../../img/node-warning.svg";
import capitalize from 'lodash/capitalize'
import { getAllowedFunctions, functionFormats } from '../../util/functionInfo'
import { Typography } from 'antd';
const { Text } = Typography;
import { Link } from 'react-router-dom';

const FunctionButton = ({ id, name, format, selected, warn }) => (
  <React.Fragment>
    <Link to={`/functions/${id}`}>
      <div
        style={{
          backgroundColor: selected ? '#8261C2' : '#9E59F6',
          borderRadius: 6,
          padding: '5px 10px 5px 10px',
          cursor: 'pointer',
          height: 50,
          minWidth: 110,
          display: 'flex',
          flexDirection: 'column',
          marginRight: 12,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100px' }}>
          {warn && <img src={Warning} style={{ height: 14, marginRight: 5 }} />}
          <img src={BarIcon} style={{ height: 12, marginRight: 4 }} />
          <Text style={{ color: '#FFFFFF', fontWeight: 500, whiteSpace: 'nowrap' }}>{name}</Text>
        </div>
        <Text style={{ color: '#FFFFFF', fontSize: 10, whiteSpace: 'nowrap' }}>{functionFormats[format]}</Text>
        {
          selected && <NavPointTriangle />
        }
      </div>
    </Link>
  </React.Fragment>
);

export default ({ functions, shownFunctionId }) => {
  const allowedFunctions = getAllowedFunctions()
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {functions.map(f => (
        <FunctionButton warn={allowedFunctions && !allowedFunctions[f.format]} key={f.id} id={f.id} format={f.format} name={f.name} selected={f.id === shownFunctionId} />
      ))}
    </div>
  );
}
