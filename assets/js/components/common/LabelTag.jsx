import React, { Component } from 'react'
import { Tag } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

const LabelTag = ({ text, color, style, closable, onClose, isNew, onClick }) => {
  let labelColor = color ? color : "geekblue"

  return (
    <Tag style={style} color={labelColor} closable={closable} onClose={onClose} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default'}}>
      {isNew && "NEW -"} {text}
    </Tag>
  )
}

export const labelColors = [
  "geekblue",
  "cyan",
  "purple",
  "magenta",
  "gold",
  "lime",
  "volcano",
]

export const labelColorsHex = {
  geekblue: "#1890ff",
  cyan: "#2ECEC4",
  purple: "#B37FEB",
  magenta: "#FF85C0",
  gold: "#F8C741",
  lime: "#7ed43a",
  volcano: "#FF7875",
}

export default LabelTag
