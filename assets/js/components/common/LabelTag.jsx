import React from 'react'
import { Tag } from 'antd';

const LabelTag = ({ text, style, closable, onClose, isNew, onClick }) => {
  let labelColor = "geekblue"

  return (
    <Tag style={style} color={labelColor} closable={closable} onClose={onClose} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default'}}>
      {isNew && "NEW -"} {text}
    </Tag>
  )
}

export default LabelTag
