import React, { Component } from 'react'
import { Tag, Icon } from 'antd';

const LabelTag = ({ text, color, style, closable, onClose, hasIntegrations, isNew, hasFunction }) => {
  let labelColor = color ? color : "geekblue"
  if (hasFunction) labelColor = labelColorsHex[labelColor]

  return (
    <Tag style={style} color={labelColor} closable={closable} onClose={onClose}>
      {hasIntegrations ? <Icon type="api" style={{ fontSize: 14 }}/> : "" } {isNew && "NEW -"} {text}
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
  geekblue: "#85A5FF",
  cyan: "#5CDBD3",
  purple: "#B37FEB",
  magenta: "#FF85C0",
  gold: "#FFD666",
  lime: "#D3F261",
  volcano: "#FF7875",
}

export default LabelTag
