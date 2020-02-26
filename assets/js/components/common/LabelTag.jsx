import React, { Component } from 'react'
import { Tag } from 'antd';

const LabelTag = ({ text, color, style, closable, onClose }) => (
  <Tag style={style} color={color ? color : "geekblue"} closable={closable} onClose={onClose}>{text}</Tag>
)

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
